export interface WashRequest {
  id: string
  status: string
  items: number
  requestedBy: string
  requestedAt: string
  priority: 'Low' | 'Medium' | 'High'
  type: 'Regular' | 'Delicate' | 'Special'
  notes?: string
}

export interface LaundryItem {
  id: string
  status: string
  items: number
  startedAt: string
  estimatedCompletion: string
  type: string
}

export interface WashTableProps {
  data: WashRequest[] | LaundryItem[]
  type: 'requests' | 'laundry'
  onView: (id: string) => void
}

export interface NewWashRequestFormData {
  items: number
  priority: 'Low' | 'Medium' | 'High'
  type: 'Regular' | 'Delicate' | 'Special'
  notes?: string
} 