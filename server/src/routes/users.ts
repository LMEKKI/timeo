import { Hono } from "hono"
import type { ZodError } from "zod"
import { auth } from "../auth"
import { requireChef } from "../middleware/guard"
import { AppError } from "../lib/errors"
import { createTechSchema, updateUserSchema } from "@shared/schemas/user"
import type { AppVariables } from "../lib/types"

function generateTempPassword(): string {
	return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
}

function firstValidationError(error: ZodError): { message: string; field?: string } {
	const issue = error.issues[0]
	return {
		message: issue?.message ?? "Données invalides",
		field: issue?.path[0]?.toString(),
	}
}

export const usersRoute = new Hono<{ Variables: AppVariables }>()
	.get("/", requireChef, async (c) => {
		const result = await auth.api.listUsers({
			query: { limit: 100 },
			headers: c.req.raw.headers,
		})
		return c.json({ data: result.users })
	})
	.post("/", requireChef, async (c) => {
		const parsed = createTechSchema.safeParse(await c.req.json())
		if (!parsed.success) {
			const { message, field } = firstValidationError(parsed.error)
			throw new AppError(400, "VALIDATION_ERROR", message, field)
		}

		const tempPassword = generateTempPassword()

		const result = await auth.api.createUser({
			body: {
				name: parsed.data.name,
				email: parsed.data.email ?? `${parsed.data.username}@timeo.local`,
				password: tempPassword,
				role: "tech",
				data: { username: parsed.data.username },
			},
			headers: c.req.raw.headers,
		})

		return c.json({ data: { user: result.user, temporaryPassword: tempPassword } }, 201)
	})
	.patch("/:id", requireChef, async (c) => {
		const parsed = updateUserSchema.safeParse(await c.req.json())
		if (!parsed.success) {
			const { message, field } = firstValidationError(parsed.error)
			throw new AppError(400, "VALIDATION_ERROR", message, field)
		}

		const updated = await auth.api.adminUpdateUser({
			body: {
				userId: c.req.param("id"),
				data: { ...parsed.data },
			},
			headers: c.req.raw.headers,
		})

		return c.json({ data: updated })
	})
