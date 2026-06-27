import { z } from "zod"

export const statusSchema = z.enum(["unassigned", "planned", "started", "completed", "cancelled"])

export const prioritySchema = z.enum(["low", "high", "urgent"])

export const teamRoleSchema = z.enum(["lead", "assistant"])

export const createInterventionSchema = z.object({
	title: z.string().min(3, "Titre trop court (3 caractères min)").max(200),
	description: z.string().max(2000).optional(),
	clientId: z.string().uuid("Client invalide"),
	interlocuteurId: z.string().uuid().optional(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (AAAA-MM-JJ)"),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide (HH:MM)"),
	priority: prioritySchema.optional(),
	chefNote: z.string().max(2000).optional(),
})

export const updateInterventionSchema = z.object({
	title: z.string().min(3).max(200).optional(),
	description: z.string().max(2000).nullable().optional(),
	interlocuteurId: z.string().uuid().nullable().optional(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
	startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
	priority: prioritySchema.optional(),
	chefNote: z.string().max(2000).nullable().optional(),
})

export const transitionInterventionSchema = z.object({
	status: statusSchema,
})

export const assignTechSchema = z.object({
	userIds: z.array(z.string().uuid()).min(1, "Au moins un technicien").max(10),
	teamRoles: z.record(z.string(), teamRoleSchema).optional(),
})

export const createNoteSchema = z.object({
	content: z.string().min(1, "Note vide").max(2000),
})

export const proximityGroupSchema = z.object({
	interventionIds: z.array(z.string().uuid()).min(2, "Au moins 2 interventions").max(50),
	maxDistanceKm: z.number().min(0.1).max(50).default(3),
})

export type CreateInterventionInput = z.infer<typeof createInterventionSchema>
export type UpdateInterventionInput = z.infer<typeof updateInterventionSchema>
export type TransitionInterventionInput = z.infer<typeof transitionInterventionSchema>
export type AssignTechInput = z.infer<typeof assignTechSchema>
export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type ProximityGroupInput = z.infer<typeof proximityGroupSchema>
