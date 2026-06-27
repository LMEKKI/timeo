import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm"
import { Hono } from "hono"
import type { ZodError } from "zod"
import {
	createInterventionSchema,
	statusSchema,
	transitionInterventionSchema,
	updateInterventionSchema,
} from "@shared/schemas/intervention"
import { db } from "../db"
import {
	clients,
	interventionNotes,
	interventions,
	interventionTechnicien,
} from "../db/schema"
import { AppError, ErrorCode } from "../lib/errors"
import type { AppVariables } from "../lib/types"
import { requireAuth } from "../middleware/auth"
import { requireChef } from "../middleware/guard"

const TRANSITION_MAP: Record<string, string[]> = {
	planned: ["started", "cancelled"],
	started: ["completed", "cancelled"],
}

function firstZodError(error: ZodError): AppError {
	const first = error.issues[0]
	return new AppError(
		400,
		ErrorCode.VALIDATION_ERROR,
		first?.message ?? "Données invalides",
		first?.path[0]?.toString(),
	)
}

async function isAssignedTo(interventionId: string, userId: string): Promise<boolean> {
	const [row] = await db
		.select()
		.from(interventionTechnicien)
		.where(
			and(
				eq(interventionTechnicien.interventionId, interventionId),
				eq(interventionTechnicien.userId, userId),
			),
		)
		.limit(1)
	return !!row
}

export const interventionsRoute = new Hono<{ Variables: AppVariables }>()
	.get("/", requireAuth, async (c) => {
		const user = c.get("user")
		if (!user) throw new AppError(401, ErrorCode.UNAUTHORIZED, "Non authentifié")

		const url = new URL(c.req.url)
		const date = url.searchParams.get("date")
		const status = url.searchParams.get("status")

		const conditions = [isNull(interventions.deletedAt)]
		if (date) conditions.push(eq(interventions.date, date))
		if (status) {
			const parsedStatus = statusSchema.safeParse(status)
			if (!parsedStatus.success) {
				throw new AppError(400, ErrorCode.VALIDATION_ERROR, "Statut invalide", "status")
			}
			conditions.push(eq(interventions.status, parsedStatus.data))
		}

		if (user.role === "tech") {
			const myAssignments = await db
				.select({ interventionId: interventionTechnicien.interventionId })
				.from(interventionTechnicien)
				.where(eq(interventionTechnicien.userId, user.id))
			const myIds = myAssignments.map((a) => a.interventionId)
			if (myIds.length === 0) return c.json({ data: [] })
			conditions.push(inArray(interventions.id, myIds))
		}

		const result = await db
			.select()
			.from(interventions)
			.where(and(...conditions))
			.orderBy(asc(interventions.date), asc(interventions.startTime))
			.limit(200)
		return c.json({ data: result })
	})

	.get("/:id", requireAuth, async (c) => {
		const id = c.req.param("id")
		const user = c.get("user")
		if (!user) throw new AppError(401, ErrorCode.UNAUTHORIZED, "Non authentifié")

		const [intervention] = await db
			.select()
			.from(interventions)
			.where(and(eq(interventions.id, id), isNull(interventions.deletedAt)))
			.limit(1)
		if (!intervention) throw new AppError(404, ErrorCode.NOT_FOUND, "Intervention introuvable")

		if (user.role === "tech" && !(await isAssignedTo(id, user.id))) {
			throw new AppError(403, ErrorCode.FORBIDDEN, "Vous n'êtes pas assigné à cette intervention")
		}

		const assignees = await db
			.select()
			.from(interventionTechnicien)
			.where(eq(interventionTechnicien.interventionId, id))
		const notes = await db
			.select()
			.from(interventionNotes)
			.where(eq(interventionNotes.interventionId, id))
			.orderBy(desc(interventionNotes.createdAt))
		return c.json({ data: { ...intervention, assignees, notes } })
	})

	.post("/", requireChef, async (c) => {
		const parsed = createInterventionSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		const [client] = await db
			.select()
			.from(clients)
			.where(eq(clients.id, parsed.data.clientId))
			.limit(1)
		if (!client)
			throw new AppError(400, ErrorCode.VALIDATION_ERROR, "Client introuvable", "clientId")

		const [intervention] = await db
			.insert(interventions)
			.values({
				title: parsed.data.title,
				description: parsed.data.description || null,
				clientId: parsed.data.clientId,
				interlocuteurId: parsed.data.interlocuteurId || null,
				date: parsed.data.date,
				startTime: parsed.data.startTime,
				priority: parsed.data.priority || null,
				chefNote: parsed.data.chefNote || null,
			})
			.returning()

		return c.json({ data: intervention }, 201)
	})

	.patch("/:id", requireChef, async (c) => {
		const id = c.req.param("id")
		const parsed = updateInterventionSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		const [updated] = await db
			.update(interventions)
			.set({ ...parsed.data, updatedAt: new Date() })
			.where(and(eq(interventions.id, id), isNull(interventions.deletedAt)))
			.returning()
		if (!updated) throw new AppError(404, ErrorCode.NOT_FOUND, "Intervention introuvable")
		return c.json({ data: updated })
	})

	.delete("/:id", requireChef, async (c) => {
		const id = c.req.param("id")
		const [deleted] = await db
			.update(interventions)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(interventions.id, id), isNull(interventions.deletedAt)))
			.returning()
		if (!deleted) throw new AppError(404, ErrorCode.NOT_FOUND, "Intervention introuvable")
		return c.body(null, 204)
	})

	.post("/:id/transition", requireAuth, async (c) => {
		const id = c.req.param("id")
		const user = c.get("user")
		if (!user) throw new AppError(401, ErrorCode.UNAUTHORIZED, "Non authentifié")

		const parsed = transitionInterventionSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		const [intervention] = await db
			.select()
			.from(interventions)
			.where(and(eq(interventions.id, id), isNull(interventions.deletedAt)))
			.limit(1)
		if (!intervention) throw new AppError(404, ErrorCode.NOT_FOUND, "Intervention introuvable")

		if (user.role === "tech" && !(await isAssignedTo(id, user.id))) {
			throw new AppError(403, ErrorCode.FORBIDDEN, "Vous n'êtes pas assigné à cette intervention")
		}

		if (user.role === "tech" && parsed.data.status === "cancelled") {
			throw new AppError(403, ErrorCode.FORBIDDEN, "Seul le chef peut annuler")
		}

		const allowed = TRANSITION_MAP[intervention.status] ?? []
		if (!allowed.includes(parsed.data.status)) {
			throw new AppError(
				409,
				ErrorCode.CONFLICT,
				`Transition invalide : ${intervention.status} → ${parsed.data.status}`,
			)
		}

		const [updated] = await db
			.update(interventions)
			.set({ status: parsed.data.status, updatedAt: new Date() })
			.where(eq(interventions.id, id))
			.returning()
		return c.json({ data: updated })
	})

export { isAssignedTo }
