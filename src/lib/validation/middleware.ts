import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { logger } from '@/utils/logger'

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error:', {
          path: req.path,
          errors: error.errors
        })

        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        })
      }

      logger.error('Unexpected validation error:', error)
      next(error)
    }
  }
}