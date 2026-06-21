import { and, eq } from "drizzle-orm"
import { db } from "../../db"
import { interlocuteur } from "../../db/schema"
import { factory } from "../../lib/hono"
import { requireAuth, requireRole } from "../../middleware/auth"
import { notFound } from "../../lib/errors"

const app = factory.createApp()

/**
 * GET /api/interlocuteurs — List all contacts, optionally filtered by client.
 *
 * The preferred CRUD routes for interlocuteurs are nested under /api/clients/:id/interlocuteurs
 * (defined in routes/clients/index.ts). This standalone listing is for convenience.
 */
app.get("/", requireAuth, requireRole("chef"), async (c) => {
  const clientId = c.req.query("clientId")

  const conditions = []
  if (clientId) conditions.push(eq(interlocuteur.clientId, clientId))

  const rows = await db
    .select()
    .from(interlocuteur)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(interlocuteur.lastName, interlocuteur.firstName)

  return c.json({ success: true, data: rows }, 200)
})

/**
 * GET /api/interlocuteurs/:id — Get a single contact.
 */
app.get("/:id", requireAuth, requireRole("chef"), async (c) => {
  const { id } = c.req.param()

  const [row] = await db
    .select()
    .from(interlocuteur)
    .where(eq(interlocuteur.id, id))
    .limit(1)

  if (!row) return notFound(c, "Interlocuteur introuvable")
  return c.json({ success: true, data: row }, 200)
})

export default app
