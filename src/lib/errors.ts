export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public originalError?: any
  ) {
    super(message)
    this.name = 'AppError'
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: this.stack,
        originalError: this.originalError
      })
    }
  }
}