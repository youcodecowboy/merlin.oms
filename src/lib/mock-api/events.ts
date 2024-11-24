import { delay } from '../utils'
import type { Event } from '../schema'
import mockDb from '@/data/mock-db.json'

export async function getMockEvents(params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  team?: string
  status?: string
  priority?: string
  startDate?: string
  endDate?: string
}): Promise<{ items: Event[]; total: number }> {
  await delay()

  let items = [...mockDb.events]

  // Apply filters
  if (params.team) {
    items = items.filter(item => item.team.toLowerCase().includes(params.team!.toLowerCase()))
  }

  if (params.status) {
    items = items.filter(item => item.status === params.status)
  }

  if (params.priority) {
    items = items.filter(item => item.priority === params.priority)
  }

  if (params.startDate) {
    items = items.filter(item => new Date(item.created_at) >= new Date(params.startDate!))
  }

  if (params.endDate) {
    items = items.filter(item => new Date(item.created_at) <= new Date(params.endDate!))
  }

  // Apply sorting
  items.sort((a, b) => {
    const aValue = a[params.sortBy as keyof Event]
    const bValue = b[params.sortBy as keyof Event]
    if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Apply pagination
  const start = (params.page - 1) * params.pageSize
  const paginatedItems = items.slice(start, start + params.pageSize)

  return {
    items: paginatedItems,
    total: items.length
  }
}

export async function createMockEvent(data: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
  await delay()

  const newEvent: Event = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...data
  }

  mockDb.events.push(newEvent)
  return newEvent
}