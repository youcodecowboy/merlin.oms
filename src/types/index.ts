// Centralize your type definitions
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
export type RequestType = 'WASH_REQUEST' | 'PATTERN_REQUEST' | /* other types */

// Props interfaces
export interface BaseTableProps {
  loading?: boolean
  onRefresh?: () => void
}

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
} 