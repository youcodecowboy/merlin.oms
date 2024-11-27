import { Link } from 'react-router-dom'
import type { DBInventoryItem } from '@/lib/schema/database'

interface InventoryItemLinkProps {
  item: DBInventoryItem | { id: string }
  children?: React.ReactNode
  className?: string
}

export function InventoryItemLink({ item, children, className }: InventoryItemLinkProps) {
  return (
    <Link 
      to={`/inv/${item.id}`}
      className={className}
    >
      {children || item.id}
    </Link>
  )
} 