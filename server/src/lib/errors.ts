/**
 * Standardized API error helper.
 *
 * Returns a JSON response consistent with the Timeo error format:
 * `{ success: false, error: { code, message, field? } }`
 */

import type { Context } from "hono"

export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const

type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

interface ErrorPayload {
  code: ErrorCodeType
  message: string
  field?: string
  details?: Record<string, unknown>
}

/**
 * 400 — Validation failed (Zod error or business rule)
 */
export function validationError(c: Context, message: string, field?: string) {
  return c.json({ success: false, error: { code: ErrorCode.VALIDATION_ERROR, message, field } }, 400 as const)
}

/**
 * 401 — Not authenticated
 */
export function unauthorized(c: Context, message = "Non authentifié") {
  return c.json({ success: false, error: { code: ErrorCode.UNAUTHORIZED, message } }, 401 as const)
}

/**
 * 403 — Insufficient permissions
 */
export function forbidden(c: Context, message = "Accès refusé") {
  return c.json({ success: false, error: { code: ErrorCode.FORBIDDEN, message } }, 403 as const)
}

/**
 * 404 — Resource not found
 */
export function notFound(c: Context, message = "Ressource introuvable") {
  return c.json({ success: false, error: { code: ErrorCode.NOT_FOUND, message } }, 404 as const)
}

/**
 * 409 — Business conflict (invalid transition, duplicate, etc.)
 */
export function conflict(c: Context, message: string, details?: Record<string, unknown>) {
  const error: ErrorPayload = { code: ErrorCode.CONFLICT, message }
  if (details) error.details = details
  return c.json({ success: false, error }, 409 as const)
}

/**
 * 500 — Unexpected server error
 */
export function internalError(c: Context, message = "Erreur serveur. Réessayez.") {
  return c.json({ success: false, error: { code: ErrorCode.INTERNAL_ERROR, message } }, 500 as const)
}
