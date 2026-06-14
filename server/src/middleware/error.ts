import type { Context } from 'hono'
import { DomainError } from 'shared'

/**
 * Global error handler for Hono.
 * Maps DomainErrors to proper HTTP responses (status + code).
 * Catches unexpected errors as 500.
 */
export function errorHandler(err: Error, c: Context) {
  if (err instanceof DomainError) {
    return c.json(
      {
        success: false,
        error: err.code,
        message: err.message,
      },
      err.httpStatus as 400 | 401 | 403 | 404 | 409 | 500,
    )
  }

  console.error('Unhandled error:', err)
  return c.json(
    {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    500,
  )
}
