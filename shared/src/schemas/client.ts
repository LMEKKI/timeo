import { z } from "zod"

export const addressInputSchema = z.object({
	label: z.string().max(100).optional(),
	line1: z.string().min(1, "Adresse obligatoire").max(200),
	line2: z.string().max(200).optional(),
	postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
	city: z.string().min(1, "Ville obligatoire").max(100),
	country: z.string().length(2).default("FR"),
	latitude: z.string().optional(),
	longitude: z.string().optional(),
})

export const createClientSchema = z.object({
	name: z.string().min(1, "Nom obligatoire").max(200),
	phone: z.string().min(1, "Téléphone obligatoire").max(30),
	email: z.string().email("Email invalide").optional().or(z.literal("")),
	notes: z.string().max(2000).optional(),
	address: addressInputSchema.optional(),
})

export const updateClientSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	phone: z.string().min(1).max(30).optional(),
	email: z.string().email().nullable().optional(),
	notes: z.string().max(2000).nullable().optional(),
})

export const createInterlocuteurSchema = z.object({
	firstName: z.string().min(1, "Prénom obligatoire").max(100),
	lastName: z.string().min(1, "Nom obligatoire").max(100),
	role: z.string().max(100).optional(),
	email: z.string().email().optional().or(z.literal("")),
	phone: z.string().max(30).optional(),
	isPrimary: z.boolean().default(false),
	notes: z.string().max(1000).optional(),
})

export type AddressInput = z.infer<typeof addressInputSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type CreateInterlocuteurInput = z.infer<typeof createInterlocuteurSchema>
