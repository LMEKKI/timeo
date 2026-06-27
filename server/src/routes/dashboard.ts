import { Hono } from "hono"
import { and, count, desc, eq, isNull, lt, sql } from "drizzle-orm"
import { db } from "../db"
import { interventionNotes, interventions, user } from "../db/schema"
import { requireChef } from "../middleware/guard"

export const dashboardRoute = new Hono()
	.use("*", requireChef)

	.get("/stats", async (c) => {
		const today = new Date().toISOString().slice(0, 10)

		const [todayTotal = { count: 0 }] = await db
			.select({ count: count() })
			.from(interventions)
			.where(and(eq(interventions.date, today), isNull(interventions.deletedAt)))

		const [completed = { count: 0 }] = await db
			.select({ count: count() })
			.from(interventions)
			.where(
				and(
					eq(interventions.date, today),
					eq(interventions.status, "completed"),
					isNull(interventions.deletedAt),
				),
			)

		const [inProgress = { count: 0 }] = await db
			.select({ count: count() })
			.from(interventions)
			.where(
				and(
					eq(interventions.date, today),
					sql`${interventions.status} IN ('planned', 'started')`,
					isNull(interventions.deletedAt),
				),
			)

		const [late = { count: 0 }] = await db
			.select({ count: count() })
			.from(interventions)
			.where(
				and(
					lt(interventions.date, today),
					sql`${interventions.status} NOT IN ('completed', 'cancelled')`,
					isNull(interventions.deletedAt),
				),
			)

		const [techs = { count: 0 }] = await db
			.select({ count: count() })
			.from(user)
			.where(sql`${user.role} = 'tech'`)

		const completionRate =
			todayTotal.count > 0 ? Math.round((completed.count / todayTotal.count) * 100) : 0

		return c.json({
			data: {
				total: todayTotal.count,
				completed: completed.count,
				inProgress: inProgress.count,
				late: late.count,
				techs: techs.count,
				completionRate,
			},
		})
	})

	.get("/activity", async (c) => {
		const recentNotes = await db
			.select({
				id: interventionNotes.id,
				content: interventionNotes.content,
				createdAt: interventionNotes.createdAt,
				interventionId: interventionNotes.interventionId,
				authorName: user.name,
			})
			.from(interventionNotes)
			.leftJoin(user, eq(interventionNotes.authorId, user.id))
			.orderBy(desc(interventionNotes.createdAt))
			.limit(20)

		return c.json({ data: recentNotes })
	})
