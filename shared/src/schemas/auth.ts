import { z } from "zod"

export const signInSchema = z.object({
	username: z.string().min(3).max(50),
	password: z.string().min(1),
})

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
})

export const mustChangePasswordResponseSchema = z.object({
	mustChangePassword: z.boolean(),
})

export type SignInInput = z.infer<typeof signInSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
