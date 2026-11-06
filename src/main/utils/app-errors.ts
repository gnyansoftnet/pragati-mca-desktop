export type ErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'DATABASE' | 'UNKNOWN'

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

export type IpcResult<T> =
  { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string } }
