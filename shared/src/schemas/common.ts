import { z } from "zod"

/**
 * Shared primitives used across multiple entity schemas.
 *
 * Import these instead of redefining patterns like UUIDs or pagination.
 */

export const uuidSchema = z.string().uuid("Identifiant invalide")

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const searchSchema = z.object({
  search: z.string().max(200).optional(),
})

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide (YYYY-MM-DD)")

export const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/, "Format heure invalide (HH:mm)")
