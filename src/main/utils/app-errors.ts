export type ErrorCode =
  'VALIDATION' | 'NOT_FOUND' | 'DATABASE' | 'EXTERNAL_API' | 'UNAUTHORIZED' | 'UNKNOWN'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = new.target.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'VALIDATION', options)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'NOT_FOUND', options)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'DATABASE', options)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'UNAUTHORIZED', options)
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'EXTERNAL_API', options)
  }
}

interface MysqlErrorLike {
  errno?: number
  sqlState?: string
  sqlMessage?: string
}

/**
 * Converts any thrown value into an AppError.
 * - AppError            -> returned as is
 * - SIGNAL '45000' (our stored procedures' business rules, errno 1644)
 *                       -> ValidationError with the readable MySQL message
 * - anything else       -> DatabaseError with the generic fallback text
 */
export const toAppError = (error: unknown, fallback: string): AppError => {
  if (error instanceof AppError) return error

  const e = error as MysqlErrorLike
  if (e?.sqlState === '45000' || e?.errno === 1644) {
    return new ValidationError(e.sqlMessage ?? fallback, { cause: error })
  }

  return new DatabaseError(fallback, { cause: error })
}
