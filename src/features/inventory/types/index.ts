import type { 
  InventoryItem,
  Request,
  Order,
  Customer,
  Event 
} from '@/lib/schema'

export interface InventoryItemDrawerProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
}

export interface DrawerData {
  activeRequest: Request | null
  events: Event[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
} 