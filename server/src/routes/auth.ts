import { Hono } from "hono"
import { eq } from "drizzle-orm"
import { db } from "../db"
import { user } from "../db/schema/better-auth"
import { auth } from "../auth"
import { requireAuth } from "../middleware/auth"
import { AppError } from "../lib/errors"
import { changePasswordSchema } from "@shared/schemas/auth"
import type { AppVariables } from "../lib/types"

export const authRoute = new Hono<{ Variables: AppVariables }>()
	.post("/change-password", requireAuth, async (c) => {
		const sessionUser = c.get("user")
		if (!sessionUser) throw new AppError(401, "UNAUTHORIZED", "Non authentifié")

		const parsed = changePasswordSchema.safeParse(await c.req.json())
		if (!parsed.success) {
			const issue = parsed.error.issues[0]
			throw new AppError(
				400,
				"VALIDATION_ERROR",
				issue?.message ?? "Données invalides",
				issue?.path[0]?.toString(),
			)
		}

		await auth.api.changePassword({
			body: {
				currentPassword: parsed.data.currentPassword,
				newPassword: parsed.data.newPassword,
				revokeOtherSessions: true,
			},
			headers: c.req.raw.headers,
		})

		return c.json({ data: { success: true } })
	})
	.patch("/me/clear-must-change", requireAuth, async (c) => {
		const sessionUser = c.get("user")
		if (!sessionUser) throw new AppError(401, "UNAUTHORIZED", "Non authentifié")

		await db
			.update(user)
			.set({ mustChangePassword: false })
			.where(eq(user.id, sessionUser.id))

		return c.json({ data: { success: true } })
	})
