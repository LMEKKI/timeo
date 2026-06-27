import { and, desc, eq, isNull, like, or } from "drizzle-orm"
import { Hono } from "hono"
import type { ZodError } from "zod"
import { createClientSchema, createInterlocuteurSchema, updateClientSchema } from "@shared/schemas/client"
import { db } from "../db"
import { addresses, clients, interlocuteurs } from "../db/schema"
import { AppError } from "../lib/errors"
import { requireChef } from "../middleware/guard"
import type { AppVariables } from "../lib/types"

function firstZodError(error: ZodError) {
	const first = error.issues[0]
	const path = first?.path ?? []
	const field = path.length > 0 ? path.map(String).join(".") : undefined
	return new AppError(400, "VALIDATION_ERROR", first?.message ?? "Données invalides", field)
}

export const clientsRoute = new Hono<{ Variables: AppVariables }>()
	.use("*", requireChef)

	.get("/", async (c) => {
		const search = new URL(c.req.url).searchParams.get("q")
		const where = search
			? and(isNull(clients.deletedAt), or(like(clients.name, `%${search}%`), like(clients.phone, `%${search}%`)))
			: isNull(clients.deletedAt)

		const result = await db.select().from(clients).where(where).orderBy(desc(clients.createdAt)).limit(100)
		return c.json({ data: result })
	})

	.get("/:id", async (c) => {
		const id = c.req.param("id")
		const [client] = await db.select().from(clients).where(and(eq(clients.id, id), isNull(clients.deletedAt))).limit(1)
		if (!client) throw new AppError(404, "NOT_FOUND", "Client introuvable")

		const interlocuteursList = await db.select().from(interlocuteurs).where(eq(interlocuteurs.clientId, id))
		return c.json({ data: { ...client, interlocuteurs: interlocuteursList } })
	})

	.post("/", async (c) => {
		const parsed = createClientSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		let addressId: string | undefined
		if (parsed.data.address) {
			const [address] = await db.insert(addresses).values(parsed.data.address).returning()
			if (address) addressId = address.id
		}

		const [client] = await db.insert(clients).values({
			name: parsed.data.name,
			phone: parsed.data.phone || null,
			email: parsed.data.email || null,
			notes: parsed.data.notes || null,
			addressId,
		}).returning()

		return c.json({ data: client }, 201)
	})

	.patch("/:id", async (c) => {
		const id = c.req.param("id")
		const parsed = updateClientSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		const [updated] = await db.update(clients)
			.set({ ...parsed.data, updatedAt: new Date() })
			.where(and(eq(clients.id, id), isNull(clients.deletedAt)))
			.returning()
		if (!updated) throw new AppError(404, "NOT_FOUND", "Client introuvable")
		return c.json({ data: updated })
	})

	.delete("/:id", async (c) => {
		const id = c.req.param("id")
		const [deleted] = await db.update(clients)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(clients.id, id), isNull(clients.deletedAt)))
			.returning()
		if (!deleted) throw new AppError(404, "NOT_FOUND", "Client introuvable")
		return c.body(null, 204)
	})

	.post("/:id/interlocuteurs", async (c) => {
		const clientId = c.req.param("id")
		const [client] = await db.select().from(clients).where(and(eq(clients.id, clientId), isNull(clients.deletedAt))).limit(1)
		if (!client) throw new AppError(404, "NOT_FOUND", "Client introuvable")

		const parsed = createInterlocuteurSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		const [interlocuteur] = await db.insert(interlocuteurs).values({
			clientId,
			firstName: parsed.data.firstName,
			lastName: parsed.data.lastName,
			role: parsed.data.role || null,
			email: parsed.data.email || null,
			phone: parsed.data.phone || null,
			isPrimary: parsed.data.isPrimary,
			notes: parsed.data.notes || null,
		}).returning()

		return c.json({ data: interlocuteur }, 201)
	})

	.patch("/:id/interlocuteurs/:iid", async (c) => {
		const clientId = c.req.param("id")
		const interlocuteurId = c.req.param("iid")
		const parsed = createInterlocuteurSchema.partial().safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		const [updated] = await db.update(interlocuteurs)
			.set({ ...parsed.data, updatedAt: new Date() })
			.where(and(eq(interlocuteurs.id, interlocuteurId), eq(interlocuteurs.clientId, clientId)))
			.returning()
		if (!updated) throw new AppError(404, "NOT_FOUND", "Interlocuteur introuvable")
		return c.json({ data: updated })
	})

	.delete("/:id/interlocuteurs/:iid", async (c) => {
		const clientId = c.req.param("id")
		const interlocuteurId = c.req.param("iid")
		const [deleted] = await db.delete(interlocuteurs)
			.where(and(eq(interlocuteurs.id, interlocuteurId), eq(interlocuteurs.clientId, clientId)))
			.returning()
		if (!deleted) throw new AppError(404, "NOT_FOUND", "Interlocuteur introuvable")
		return c.body(null, 204)
	})
