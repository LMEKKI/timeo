import { DomainError } from './domain-error'

/**
 * Thrown when the provided email/password combination is invalid.
 */
export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS'
  readonly httpStatus = 401

  constructor() {
    super('Invalid email or password')
  }
}

/**
 * Thrown when the user session has expired and needs re-authentication.
 */
export class SessionExpiredError extends DomainError {
  readonly code = 'SESSION_EXPIRED'
  readonly httpStatus = 401

  constructor() {
    super('Session has expired')
  }
}

/**
 * Thrown when the authenticated user does not have the required role
 * or permission to perform an action.
 */
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED'
  readonly httpStatus = 403

  constructor(role?: string) {
    super(role ? `Access denied: ${role} role required` : 'Access denied')
  }
}

/**
 * Thrown when a user lookup by identifier (email, id, etc.) returns no result.
 */
export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND'
  readonly httpStatus = 404

  constructor(identifier: string) {
    super(`User not found: ${identifier}`)
  }
}
