import { Hono } from "hono"
import type { ZodError } from "zod"
import { createNoteSchema } from "@shared/schemas/intervention"
import { db } from "../db"
import { interventionNotes } from "../db/schema"
import { AppError, ErrorCode } from "../lib/errors"
import type { AppVariables } from "../lib/types"
import { requireAuth } from "../middleware/auth"
import { isAssignedTo } from "./interventions"

function firstZodError(error: ZodError): AppError {
	const first = error.issues[0]
	return new AppError(
		400,
		ErrorCode.VALIDATION_ERROR,
		first?.message ?? "Données invalides",
		first?.path[0]?.toString(),
	)
}

export const interventionNotesRoute = new Hono<{ Variables: AppVariables }>()
	.post("/:id/notes", requireAuth, async (c) => {
		const id = c.req.param("id")
		const user = c.get("user")
		if (!user) throw new AppError(401, ErrorCode.UNAUTHORIZED, "Non authentifié")

		const parsed = createNoteSchema.safeParse(await c.req.json())
		if (!parsed.success) throw firstZodError(parsed.error)

		if (user.role === "tech" && !(await isAssignedTo(id, user.id))) {
			throw new AppError(403, ErrorCode.FORBIDDEN, "Vous n'êtes pas assigné à cette intervention")
		}

		const [note] = await db
			.insert(interventionNotes)
			.values({ interventionId: id, authorId: user.id, content: parsed.data.content })
			.returning()
		return c.json({ data: note }, 201)
	})
