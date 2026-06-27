import { z } from "zod"

export const availabilityStatusSchema = z.enum(["available", "on_mission", "absent"])

export const userRoleSchema = z.enum(["chef", "tech"])

export const createTechSchema = z.object({
	name: z.string().min(1, "Nom obligatoire").max(200),
	username: z
		.string()
		.min(3, "Username trop court")
		.max(50)
		.regex(/^[a-z0-9_-]+$/, "Username invalide (a-z, 0-9, _, -)"),
	email: z.string().email("Email invalide").optional(),
	availabilityStatus: availabilityStatusSchema.default("available"),
})

export const updateUserSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	email: z.string().email().nullable().optional(),
	availabilityStatus: availabilityStatusSchema.optional(),
})

export const userSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().nullable(),
	username: z.string(),
	displayUsername: z.string().nullable(),
	role: userRoleSchema,
	availabilityStatus: availabilityStatusSchema,
	mustChangePassword: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export type CreateTechInput = z.infer<typeof createTechSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type User = z.infer<typeof userSchema>
