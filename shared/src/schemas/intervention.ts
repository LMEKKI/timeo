import { z } from "zod"

export const interventionStatusEnum = z.enum([
  "non_planifiee",
  "planifiee",
  "en_route",
  "en_cours",
  "terminee",
  "annulee",
])

export type InterventionStatus = z.infer<typeof interventionStatusEnum>

export const prioriteEnum = z.enum(["basse", "normale", "haute", "urgente"])
export type Priorite = z.infer<typeof prioriteEnum>

/**
 * TRANSITION_MAP: Defines valid status transitions for the FSM.
 *
 * Shared between server (for validation) and client (for UI state management).
 * Each key maps to an array of valid next statuses.
 */
export const TRANSITION_MAP = {
  non_planifiee: ["planifiee", "annulee"],
  planifiee: ["en_route", "annulee"],
  en_route: ["en_cours", "annulee"],
  en_cours: ["terminee", "annulee"],
  terminee: [],
  annulee: [],
} as const satisfies Record<InterventionStatus, readonly InterventionStatus[]>

export type AllowedTransition = (typeof TRANSITION_MAP)[InterventionStatus][number]

/**
 * Check if a status transition is valid.
 */
export function canTransition(
  current: InterventionStatus,
  target: InterventionStatus,
): target is AllowedTransition {
  return (TRANSITION_MAP[current] as readonly InterventionStatus[]).includes(target)
}

// ─── Create ───────────────────────────────────────────────────────────────────

export const createInterventionSchema = z.object({
  title: z.string().min(3, "Titre trop court (min 3)").max(200, "Titre trop long (max 200)"),
  description: z.string().max(2000).optional(),
  clientId: z.string().uuid("Client invalide"),
  interlocuteurId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format heure invalide"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format heure invalide").optional(),
  priorite: prioriteEnum.optional(),
  address: z.string().max(500).optional(),
})

export type CreateIntervention = z.infer<typeof createInterventionSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateInterventionSchema = createInterventionSchema.partial()

export type UpdateIntervention = z.infer<typeof updateInterventionSchema>

// ─── Filters / Query ──────────────────────────────────────────────────────────

export const interventionFiltersSchema = z.object({
  statut: interventionStatusEnum.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  technicienId: z.string().uuid().optional(),
  priorite: prioriteEnum.optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type InterventionFilters = z.infer<typeof interventionFiltersSchema>

// ─── Status Transition ────────────────────────────────────────────────────────

export const transitionSchema = z.object({
  statut: interventionStatusEnum,
  reason: z.string().max(500).optional(),
})

export type TransitionInput = z.infer<typeof transitionSchema>

// ─── Assign ───────────────────────────────────────────────────────────────────

export const assignSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, "Au moins un technicien requis").max(5, "Maximum 5 techniciens"),
})

export type AssignInput = z.infer<typeof assignSchema>

// ─── Notes ────────────────────────────────────────────────────────────────────

export const createNoteSchema = z.object({
  content: z.string().min(1, "Note vide").max(2000, "Note trop longue"),
})

export type CreateNote = z.infer<typeof createNoteSchema>
