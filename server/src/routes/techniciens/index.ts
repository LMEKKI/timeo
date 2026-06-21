import { z } from "zod"
import { and, eq, ilike, or } from "drizzle-orm"
import { db } from "../../db"
import { user, userProfile } from "../../db/schema"
import { factory } from "../../lib/hono"
import { requireAuth, requireRole } from "../../middleware/auth"
import { zValidate } from "../../middleware/validate"
import { notFound } from "../../lib/errors"

/**
 * Technicien routes.
 *
 * Maps to the `/api/techniciens` prefix. All routes require auth.
 * Listing and profile viewing is chef-only (techs see their own profile via /me).
 */

const app = factory.createApp()

// ─── Query schema ─────────────────────────────────────────────────────────────

const listQuerySchema = z.object({
  disponibilite: z.enum(["disponible", "indisponible", "en_intervention"]).optional(),
  search: z.string().max(200).optional(),
})

const disponibiliteSchema = z.object({
  disponibilite: z.enum(["disponible", "indisponible", "en_intervention"]),
})

// ─── GET /api/techniciens — List all technicians ──────────────────────────────

app.get("/", requireAuth, requireRole("chef"), async (c) => {
  const query = listQuerySchema.parse(c.req.query())

  const conditions = [eq(userProfile.role, "tech")]

  if (query.disponibilite) {
    conditions.push(eq(userProfile.disponibilite, query.disponibilite))
  }

  if (query.search) {
    conditions.push(
      or(
        ilike(user.name, `%${query.search}%`),
        ilike(user.username, `%${query.search}%`),
      ),
    )
  }

  const techs = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      disponibilite: userProfile.disponibilite,
      createdAt: user.createdAt,
    })
    .from(user)
    .innerJoin(userProfile, eq(user.id, userProfile.userId))
    .where(and(...conditions))
    .orderBy(user.name)

  return c.json({ success: true, data: techs }, 200)
})

// ─── GET /api/techniciens/:id — Tech profile ──────────────────────────────────

app.get("/:id", requireAuth, requireRole("chef"), async (c) => {
  const { id } = c.req.param()

  const [tech] = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: userProfile.role,
      disponibilite: userProfile.disponibilite,
      forcePasswordChange: userProfile.forcePasswordChange,
      createdAt: user.createdAt,
      updatedAt: userProfile.updatedAt,
    })
    .from(user)
    .innerJoin(userProfile, eq(user.id, userProfile.userId))
    .where(eq(user.id, id))
    .limit(1)

  if (!tech) return notFound(c, "Technicien introuvable")

  return c.json({ success: true, data: tech }, 200)
})

// ─── PATCH /api/techniciens/:id/disponibilite — Update availability ───────────

app.patch(
  "/:id/disponibilite",
  requireAuth,
  requireRole("chef"),
  zValidate("json", disponibiliteSchema),
  async (c) => {
    const { id } = c.req.param()
    const { disponibilite } = c.var.validated as { disponibilite: "disponible" | "indisponible" | "en_intervention" }

    const [updated] = await db
      .update(userProfile)
      .set({ disponibilite })
      .where(eq(userProfile.userId, id))
      .returning({ disponibilite: userProfile.disponibilite })

    if (!updated) return notFound(c, "Technicien introuvable")

    return c.json({ success: true, data: { disponibilite: updated.disponibilite } }, 200)
  },
)

export default app
