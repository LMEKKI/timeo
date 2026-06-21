import { z } from "zod"

export const clientSourceEnum = z.enum(["interne", "crm"])
export type ClientSource = z.infer<typeof clientSourceEnum>

// ─── Address ──────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  street: z.string().min(1, "Rue obligatoire").max(200),
  city: z.string().min(1, "Ville obligatoire").max(100),
  postalCode: z.string().min(1, "Code postal obligatoire").max(20),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  complement: z.string().max(200).optional(),
})

export type AddressInput = z.infer<typeof addressSchema>

// ─── Create Client ────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(200, "Nom trop long"),
  address: addressSchema,
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
  source: clientSourceEnum.default("interne"),
  crmId: z.string().max(100).optional(),
}).refine(
  (data) => data.source !== "crm" || data.crmId,
  { message: "crmId requis pour les clients CRM", path: ["crmId"] },
)

export type CreateClient = z.infer<typeof createClientSchema>

// ─── Update Client ────────────────────────────────────────────────────────────

export const updateClientSchema = createClientSchema.partial()

export type UpdateClient = z.infer<typeof updateClientSchema>

// ─── Interlocuteur ────────────────────────────────────────────────────────────

export const createInterlocuteurSchema = z.object({
  firstName: z.string().min(1, "Prénom obligatoire").max(100),
  lastName: z.string().min(1, "Nom obligatoire").max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

export type CreateInterlocuteur = z.infer<typeof createInterlocuteurSchema>

export const updateInterlocuteurSchema = createInterlocuteurSchema.partial()
export type UpdateInterlocuteur = z.infer<typeof updateInterlocuteurSchema>

// ─── Filters ──────────────────────────────────────────────────────────────────

export const clientFiltersSchema = z.object({
  search: z.string().max(200).optional(),
  source: clientSourceEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type ClientFilters = z.infer<typeof clientFiltersSchema>
