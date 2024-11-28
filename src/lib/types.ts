export type RequestStep = {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  requiresScan?: boolean;
  scanTarget?: string;
};

export type WashRequest = {
  id: string;
  item_id: string;
  order_id: string;
  target_wash: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps: RequestStep[];
  created_at: string;
  updated_at: string;
};

export type SKU = string

export interface Order {
  id: string
  customer_id: string
  status: OrderStatus
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'WAITLISTED'
  | 'PENDING_PRODUCTION'
  | 'COMPLETED'
  | 'CANCELLED'

export interface InventoryItem {
  id: string
  sku: SKU
  status1: Status1
  status2: Status2
  location: string
  order_id?: string
  created_at: string
  updated_at: string
}

export type Status1 = 
  | 'PRODUCTION'
  | 'STOCK'
  | 'WASH'
  | 'QC'
  | 'FINISHING'
  | 'PACKED'

export type Status2 = 
  | 'UNCOMMITTED'
  | 'COMMITTED'
  | 'ASSIGNED'

export interface Bin {
  id: string
  name: string
  zone: string
  max_capacity: number
  current_count: number
  sku_groups: Record<string, number>
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  created_at: string
  updated_at: string
} 