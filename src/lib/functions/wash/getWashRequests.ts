import { mockDB } from '@/lib/mock-db/store'
import type { DBRequest } from '@/lib/schema/database'

export function getWashRequests(): DBRequest[] {
  return mockDB.requests.filter(req => 
    req.request_type === 'WASHING' && 
    (req.status === 'PENDING' || req.status === 'IN_PROGRESS')
  )
} 