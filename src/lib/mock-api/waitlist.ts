import { nanoid } from 'nanoid'

interface SkuWaitlistEntry {
  id: string
  sku: string
  order_id: string
  quantity: number
  position: number
  created_at: string
}

// Initialize waitlist storage
const STORAGE_KEY = 'mockSkuWaitlist'
let mockSkuWaitlist: SkuWaitlistEntry[] = (() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
})()

// Helper to save to localStorage
function persistWaitlist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSkuWaitlist))
}

export async function addToSkuWaitlist(entry: Omit<SkuWaitlistEntry, 'id' | 'position'>): Promise<SkuWaitlistEntry> {
  const position = mockSkuWaitlist.filter(item => item.sku === entry.sku).length + 1
  
  const waitlistEntry: SkuWaitlistEntry = {
    id: nanoid(),
    position,
    ...entry
  }

  mockSkuWaitlist.push(waitlistEntry)
  persistWaitlist()
  return waitlistEntry
}

export async function getSkuWaitlist(sku: string): Promise<SkuWaitlistEntry[]> {
  return mockSkuWaitlist.filter(entry => entry.sku === sku)
}

export async function removeFromWaitlist(id: string): Promise<void> {
  mockSkuWaitlist = mockSkuWaitlist.filter(entry => entry.id !== id)
  persistWaitlist()
} 