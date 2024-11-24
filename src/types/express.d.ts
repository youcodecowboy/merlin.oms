import { z } from 'zod'
import { createOrderSchema, createInventoryItemSchema } from '@/lib/validation/schemas'

declare global {
  namespace Express {
    interface Request {
      validatedBody: {
        order?: z.infer<typeof createOrderSchema>
        inventory?: z.infer<typeof createInventoryItemSchema>
      }
    }
  }
}