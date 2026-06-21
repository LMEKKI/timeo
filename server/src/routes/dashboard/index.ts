import { and, count, eq, gte, isNull, lte, sql } from "drizzle-orm"
import { db } from "../../db"
import { intervention, interventionTechnician, user, userProfile } from "../../db/schema"
import { factory } from "../../lib/hono"
import { requireAuth, requireRole } from "../../middleware/auth"

const app = factory.createApp()

/**
 * GET /api/dashboard/stats — Key metrics for the chef.
 *
 * Returns counts for today's interventions, by status, overdue items,
 * and overall completion rate.
 */
app.get("/stats", requireAuth, requireRole("chef"), async (c) => {
  const today = new Date().toISOString().slice(0, 10)

  const [statusCounts] = await db
    .select({
      total: count(),
      nonPlanifiee: sql<number>`count(*) FILTER (WHERE statut = 'non_planifiee')`,
      planifiee: sql<number>`count(*) FILTER (WHERE statut = 'planifiee')`,
      enRoute: sql<number>`count(*) FILTER (WHERE statut = 'en_route')`,
      enCours: sql<number>`count(*) FILTER (WHERE statut = 'en_cours')`,
      terminee: sql<number>`count(*) FILTER (WHERE statut = 'terminee')`,
      annulee: sql<number>`count(*) FILTER (WHERE statut = 'annulee')`,
    })
    .from(intervention)
    .where(isNull(intervention.deletedAt))

  const [todayCount] = await db
    .select({ count: count() })
    .from(intervention)
    .where(and(isNull(intervention.deletedAt), eq(intervention.date, today)))

  const [overdueCount] = await db
    .select({ count: count() })
    .from(intervention)
    .where(
      and(
        isNull(intervention.deletedAt),
        lte(intervention.date, today),
        sql`statut NOT IN ('terminee', 'annulee')`,
      ),
    )

  const [activeTechs] = await db
    .select({ count: count() })
    .from(userProfile)
    .where(eq(userProfile.disponibilite, "en_intervention"))

  const completionRate =
    statusCounts.total > 0
      ? Math.round((Number(statusCounts.terminee) / Number(statusCounts.total)) * 100)
      : 0

  return c.json(
    {
      success: true,
      data: {
        total: Number(statusCounts.total),
        today: Number(todayCount.count),
        overdue: Number(overdueCount.count),
        activeTechs: Number(activeTechs.count),
        completionRate,
        byStatus: {
          nonPlanifiee: Number(statusCounts.nonPlanifiee),
          planifiee: Number(statusCounts.planifiee),
          enRoute: Number(statusCounts.enRoute),
          enCours: Number(statusCounts.enCours),
          terminee: Number(statusCounts.terminee),
          annulee: Number(statusCounts.annulee),
        },
      },
    },
    200,
  )
})

/**
 * GET /api/dashboard/techniciens/charge — Workload per technician.
 *
 * Returns each tech with their active intervention count for today.
 */
app.get("/techniciens/charge", requireAuth, requireRole("chef"), async (c) => {
  const today = new Date().toISOString().slice(0, 10)

  const techLoad = await db
    .select({
      userId: user.id,
      userName: user.name,
      disponibilite: userProfile.disponibilite,
      activeCount: sql<number>`COUNT(i.id) FILTER (WHERE i.statut NOT IN ('terminee', 'annulee') AND i.date = ${today})`,
      todayTotal: sql<number>`COUNT(i.id) FILTER (WHERE i.date = ${today})`,
    })
    .from(user)
    .innerJoin(userProfile, eq(user.id, userProfile.userId))
    .leftJoin(interventionTechnician, eq(user.id, interventionTechnician.userId))
    .leftJoin(intervention, eq(interventionTechnician.interventionId, intervention.id))
    .where(eq(userProfile.role, "tech"))
    .groupBy(user.id, user.name, userProfile.disponibilite)
    .orderBy(user.name)

  return c.json({ success: true, data: techLoad }, 200)
})

/**
 * GET /api/dashboard/calendar — Calendar data for the timeline view.
 *
 * Returns interventions grouped by date for the given range.
 */
app.get("/calendar", requireAuth, requireRole("chef"), async (c) => {
  const today = new Date().toISOString().slice(0, 10)

  const interventions = await db
    .select({
      id: intervention.id,
      title: intervention.title,
      date: intervention.date,
      startTime: intervention.startTime,
      endTime: intervention.endTime,
      statut: intervention.statut,
      priorite: intervention.priorite,
    })
    .from(intervention)
    .where(and(isNull(intervention.deletedAt), gte(intervention.date, today)))
    .orderBy(intervention.date, intervention.startTime)

  return c.json({ success: true, data: interventions }, 200)
})

export default app
