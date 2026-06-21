import { z } from "zod"

export const userRoleEnum = z.enum(["chef", "tech"])
export type UserRole = z.infer<typeof userRoleEnum>

export const disponibiliteEnum = z.enum(["disponible", "indisponible", "en_intervention"])
export type Disponibilite = z.infer<typeof disponibiliteEnum>

// ─── Create User (chef creates a tech account) ────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  username: z.string().min(3, "Username trop court (min 3)").max(50),
  password: z.string().min(6, "Mot de passe trop court (min 6)").max(100),
  role: userRoleEnum.default("tech"),
})

export type CreateUser = z.infer<typeof createUserSchema>

// ─── Update User ──────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  disponibilite: disponibiliteEnum.optional(),
})

export type UpdateUser = z.infer<typeof updateUserSchema>

// ─── Availability Update ──────────────────────────────────────────────────────

export const updateDisponibiliteSchema = z.object({
  disponibilite: disponibiliteEnum,
})

export type UpdateDisponibilite = z.infer<typeof updateDisponibiliteSchema>

// ─── Filters ──────────────────────────────────────────────────────────────────

export const userFiltersSchema = z.object({
  role: userRoleEnum.optional(),
  disponibilite: disponibiliteEnum.optional(),
  search: z.string().max(200).optional(),
})

export type UserFilters = z.infer<typeof userFiltersSchema>
