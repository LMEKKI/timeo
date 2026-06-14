/**
 * Abstract base class for all domain errors.
 *
 * Every business error in the application must extend this class.
 * It provides a machine-readable `code` and an `httpStatus`
 * so that error handlers can map errors consistently to API responses.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string
  abstract readonly httpStatus: number

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
