import { z } from "zod"
import { and, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm"
import { db } from "../../db"
import { client, interlocuteur, address, intervention } from "../../db/schema"
import { factory } from "../../lib/hono"
import { requireAuth, requireRole } from "../../middleware/auth"
import { zValidate } from "../../middleware/validate"
import { notFound } from "../../lib/errors"

const app = factory.createApp()

// ─── Query schemas ────────────────────────────────────────────────────────────

const listQuerySchema = z.object({
  search: z.string().max(200).optional(),
  source: z.enum(["interne", "crm"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const addressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  complement: z.string().max(200).optional(),
})

const createClientSchema = z.object({
  name: z.string().min(2).max(200),
  address: addressSchema,
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
  source: z.enum(["interne", "crm"]).default("interne"),
  crmId: z.string().max(100).optional(),
})

const updateClientSchema = createClientSchema.partial()

const interlocuteurSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

const updateInterlocuteurSchema = interlocuteurSchema.partial()

// ─── GET /api/clients — List clients ──────────────────────────────────────────

app.get("/", requireAuth, requireRole("chef"), async (c) => {
  const query = listQuerySchema.parse(c.req.query())
  const conditions = [isNull(client.deletedAt)]

  if (query.search) {
    conditions.push(ilike(client.name, `%${query.search}%`))
  }
  if (query.source) {
    conditions.push(eq(client.source, query.source))
  }

  const where = and(...conditions)

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        source: client.source,
        createdAt: client.createdAt,
      })
      .from(client)
      .where(where)
      .orderBy(desc(client.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: count() }).from(client).where(where),
  ])

  return c.json(
    {
      success: true,
      data: rows,
      meta: { total: Number(totalResult[0].count), page: query.page, pageSize: query.pageSize },
    },
    200,
  )
})

// ─── GET /api/clients/:id — Client detail ─────────────────────────────────────

app.get("/:id", requireAuth, requireRole("chef"), async (c) => {
  const { id } = c.req.param()

  const [row] = await db
    .select({
      client: client,
      address: address,
    })
    .from(client)
    .leftJoin(address, eq(client.addressId, address.id))
    .where(and(eq(client.id, id), isNull(client.deletedAt)))
    .limit(1)

  if (!row) return notFound(c, "Client introuvable")

  const [interlocuteurs, interventions] = await Promise.all([
    db
      .select()
      .from(interlocuteur)
      .where(eq(interlocuteur.clientId, id)),
    db
      .select({
        id: intervention.id,
        title: intervention.title,
        statut: intervention.statut,
        date: intervention.date,
        priorite: intervention.priorite,
      })
      .from(intervention)
      .where(and(eq(intervention.clientId, id), isNull(intervention.deletedAt)))
      .orderBy(desc(intervention.date)),
  ])

  return c.json({
    success: true,
    data: {
      ...row.client,
      address: row.address,
      interlocuteurs,
      interventions,
    },
  }, 200)
})

// ─── POST /api/clients — Create client ────────────────────────────────────────

app.post("/", requireAuth, requireRole("chef"), zValidate("json", createClientSchema), async (c) => {
  const data = c.var.validated as z.infer<typeof createClientSchema>

  const [addr] = await db.insert(address).values(data.address).returning()

  const [newClient] = await db
    .insert(client)
    .values({
      name: data.name,
      addressId: addr.id,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      source: data.source,
      crmId: data.crmId,
    })
    .returning()

  return c.json({ success: true, data: { ...newClient, address: addr } }, 201)
})

// ─── PUT /api/clients/:id — Update client ─────────────────────────────────────

app.put("/:id", requireAuth, requireRole("chef"), zValidate("json", updateClientSchema), async (c) => {
  const { id } = c.req.param()
  const data = c.var.validated as z.infer<typeof updateClientSchema>

  const [existing] = await db
    .select()
    .from(client)
    .where(and(eq(client.id, id), isNull(client.deletedAt)))
    .limit(1)

  if (!existing) return notFound(c, "Client introuvable")

  // Update address if provided
  if (data.address) {
    await db.update(address).set(data.address).where(eq(address.id, existing.addressId))
  }

  const { address: _, ...clientData } = data

  const [updated] = await db
    .update(client)
    .set(clientData)
    .where(eq(client.id, id))
    .returning()

  return c.json({ success: true, data: updated }, 200)
})

// ─── DELETE /api/clients/:id — Soft delete ────────────────────────────────────

app.delete("/:id", requireAuth, requireRole("chef"), async (c) => {
  const { id } = c.req.param()

  const [existing] = await db
    .select()
    .from(client)
    .where(and(eq(client.id, id), isNull(client.deletedAt)))
    .limit(1)

  if (!existing) return notFound(c, "Client introuvable")

  await db.update(client).set({ deletedAt: sql`now()` }).where(eq(client.id, id))
  return c.body(null, 204)
})

// ─── POST /api/clients/:id/interlocuteurs — Add interlocutor ──────────────────

app.post("/:id/interlocuteurs", requireAuth, requireRole("chef"), zValidate("json", interlocuteurSchema), async (c) => {
  const { id } = c.req.param()
  const data = c.var.validated as z.infer<typeof interlocuteurSchema>

  const [existing] = await db
    .select({ id: client.id })
    .from(client)
    .where(and(eq(client.id, id), isNull(client.deletedAt)))
    .limit(1)

  if (!existing) return notFound(c, "Client introuvable")

  const [newInterlocuteur] = await db
    .insert(interlocuteur)
    .values({ ...data, clientId: id })
    .returning()

  return c.json({ success: true, data: newInterlocuteur }, 201)
})

// ─── PATCH /api/clients/:id/interlocuteurs/:iid — Update interlocutor ─────────

app.patch("/:id/interlocuteurs/:iid", requireAuth, requireRole("chef"), zValidate("json", updateInterlocuteurSchema), async (c) => {
  const { id, iid } = c.req.param()
  const data = c.var.validated as z.infer<typeof updateInterlocuteurSchema>

  const [updated] = await db
    .update(interlocuteur)
    .set(data)
    .where(and(eq(interlocuteur.id, iid), eq(interlocuteur.clientId, id)))
    .returning()

  if (!updated) return notFound(c, "Interlocuteur introuvable")
  return c.json({ success: true, data: updated }, 200)
})

// ─── DELETE /api/clients/:id/interlocuteurs/:iid — Delete interlocutor ────────

app.delete("/:id/interlocuteurs/:iid", requireAuth, requireRole("chef"), async (c) => {
  const { id, iid } = c.req.param()

  const [deleted] = await db
    .delete(interlocuteur)
    .where(and(eq(interlocuteur.id, iid), eq(interlocuteur.clientId, id)))
    .returning({ id: interlocuteur.id })

  if (!deleted) return notFound(c, "Interlocuteur introuvable")
  return c.body(null, 204)
})

export default app
