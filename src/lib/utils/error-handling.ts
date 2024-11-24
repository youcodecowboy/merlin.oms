import { ApiError } from '../api-types'

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }

  static fromApiError(error: ApiError): AppError {
    return new AppError(error.message, error.code, error.details)
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }
}

export function handleError(error: unknown): AppError {
  if (AppError.isAppError(error)) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(error.message)
  }
  
  return new AppError('An unknown error occurred')
} 