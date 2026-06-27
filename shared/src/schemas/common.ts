import { z } from "zod"

export const uuidSchema = z.string().uuid("ID invalide")

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const idParamSchema = z.object({
	id: uuidSchema,
})

export const errorEnvelopeSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
		field: z.string().optional(),
	}),
})
