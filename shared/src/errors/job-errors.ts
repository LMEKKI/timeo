import { DomainError } from './domain-error'

/**
 * Thrown when a job lookup by id returns no result.
 */
export class JobNotFoundError extends DomainError {
  readonly code = 'JOB_NOT_FOUND'
  readonly httpStatus = 404

  constructor(id: string) {
    super(`Job not found: ${id}`)
  }
}

/**
 * Thrown when attempting an invalid job status transition
 * (e.g. IN_PROGRESS → SCHEDULED).
 */
export class InvalidTransitionError extends DomainError {
  readonly code = 'INVALID_TRANSITION'
  readonly httpStatus = 409

  constructor(from: string, to: string) {
    super(`Invalid status transition: ${from} → ${to}`)
  }
}

/**
 * Thrown when a technician tries to start a route more than
 * 24 hours before the scheduled time.
 */
export class EarlyDepartureError extends DomainError {
  readonly code = 'EARLY_DEPARTURE'
  readonly httpStatus = 400

  constructor() {
    super('Cannot start route more than 24h before scheduled time')
  }
}

/**
 * Thrown when the technician's GPS position is outside
 * the allowed geofence area around the branch or customer.
 */
export class GeofencingError extends DomainError {
  readonly code = 'GEOFENCING_FAILED'
  readonly httpStatus = 403

  constructor() {
    super('Technician is not within the allowed geofence area')
  }
}

/**
 * Thrown when a concurrent modification is detected via optimistic locking
 * (version mismatch). The caller should retry the operation.
 */
export class OptimisticLockError extends DomainError {
  readonly code = 'OPTIMISTIC_LOCK'
  readonly httpStatus = 409

  constructor() {
    super('Concurrent modification detected, please retry')
  }
}

/**
 * Thrown when a business action requires a reason but none was provided
 * (e.g. cancelling a job without a comment).
 */
export class MissingReasonError extends DomainError {
  readonly code = 'MISSING_REASON'
  readonly httpStatus = 400

  constructor(action: string) {
    super(`A reason is required for: ${action}`)
  }
}
