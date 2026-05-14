/**
 * Base application error with a machine-readable `.code` string.
 * All platform errors extend this class so consumers can route by `error.code`.
 */
export class AppError extends Error {
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'AppError'
    this.code = code

    // Restore prototype chain for `instanceof` checks across package boundaries
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Raised when input validation fails.
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * Raised when a requested resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

/**
 * Raised when authentication is missing or invalid.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Raised when the authenticated user lacks permission for the requested action.
 */
export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * Raised when an unexpected internal error occurs.
 */
export class InternalError extends AppError {
  constructor(message: string) {
    super(message, 'INTERNAL_ERROR')
    this.name = 'InternalError'
  }
}
