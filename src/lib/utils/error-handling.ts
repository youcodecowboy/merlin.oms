import { ApiError } from '../api-types'

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }

  static fromApiError(error: ApiError): AppError {
    return new AppError(error.code, error.message, error.metadata)
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }
}

export const errorHandler = {
  handle(error: unknown, context: string) {
    // Log error
    console.error(`Error in ${context}:`, error)
    
    // Create standardized error
    const appError = error instanceof AppError ? error : 
      new AppError('UNKNOWN_ERROR', 'An unexpected error occurred')
    
    // Log to monitoring
    logError(appError)
    
    return appError
  }
} 