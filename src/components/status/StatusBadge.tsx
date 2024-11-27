import { Badge } from "@/components/ui/badge"
import type { OrderStatus, ItemStatus1, ItemStatus2 } from "@/lib/schema/status"

interface StatusBadgeProps {
  status: OrderStatus | ItemStatus1 | ItemStatus2
  type?: 'order' | 'item1' | 'item2'
}

export function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const variant = getStatusVariant(status, type)
  
  return (
    <Badge variant={variant}>
      {formatStatus(status)}
    </Badge>
  )
}

function getStatusVariant(
  status: string, 
  type: 'order' | 'item1' | 'item2'
): "default" | "secondary" | "destructive" | "outline" {
  if (type === 'order') {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'QC_FAILED': return 'destructive'
      case 'PROCESSING': return 'secondary'
      default: return 'outline'
    }
  }
  
  if (type === 'item1') {
    switch (status) {
      case 'STOCK': return 'default'
      case 'PRODUCTION': return 'secondary'
      default: return 'outline'
    }
  }

  // item2
  switch (status) {
    case 'ASSIGNED': return 'default'
    case 'COMMITTED': return 'secondary'
    case 'UNCOMMITTED': return 'outline'
    default: return 'outline'
  }
}

function formatStatus(status: string): string {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
} 