import { and, eq, isNull } from "drizzle-orm"
import { Hono } from "hono"
import type { ZodError } from "zod"
import { assignTechSchema } from "@shared/schemas/intervention"
import { db } from "../db"
import { interventions, interventionTechnicien } from "../db/schema"
import { AppError, ErrorCode } from "../lib/errors"
import type { AppVariables } from "../lib/types"
import { requireChef } from "../middleware/guard"

function firstZodError(error: ZodError): AppError {
	const first = error.issues[0]
	return new AppError(
		400,
		ErrorCode.VALIDATION_ERROR,
		first?.message ?? "Données invalides",
		first?.path[0]?.toString(),
	)
}

export const interventionAssignmentsRoute = new Hono<{ Variables: AppVariables }>()
	.post("/:id/assign", requireChef, async (c) => {
		const id = c.req.param("id")
		const parsed = assignTechSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		const [intervention] = await db
			.select()
			.from(interventions)
			.where(and(eq(interventions.id, id), isNull(interventions.deletedAt)))
			.limit(1)
		if (!intervention) throw new AppError(404, ErrorCode.NOT_FOUND, "Intervention introuvable")

		await db.delete(interventionTechnicien).where(eq(interventionTechnicien.interventionId, id))

		if (parsed.data.userIds.length > 0) {
			const values = parsed.data.userIds.map((userId) => ({
				interventionId: id,
				userId,
				teamRole: parsed.data.teamRoles?.[userId] ?? "assistant",
			}))
			await db.insert(interventionTechnicien).values(values)
		}

		const [updated] = await db
			.update(interventions)
			.set({ status: "planned", updatedAt: new Date() })
			.where(eq(interventions.id, id))
			.returning()

		return c.json({ data: updated })
	})

	.delete("/:id/assign/:userId", requireChef, async (c) => {
		const id = c.req.param("id")
		const userId = c.req.param("userId")
		await db
			.delete(interventionTechnicien)
			.where(
				and(
					eq(interventionTechnicien.interventionId, id),
					eq(interventionTechnicien.userId, userId),
				),
			)

		const remaining = await db
			.select()
			.from(interventionTechnicien)
			.where(eq(interventionTechnicien.interventionId, id))
			.limit(1)

		if (remaining.length === 0) {
			await db
				.update(interventions)
				.set({ status: "unassigned", updatedAt: new Date() })
				.where(eq(interventions.id, id))
		}

		return c.body(null, 204)
	})
