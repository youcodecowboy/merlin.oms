import { Link } from 'react-router-dom'
import type { DBOrder } from '@/lib/schema/database'

interface OrderLinkProps {
  order: DBOrder | { id: string, number: string }
  children?: React.ReactNode
  className?: string
}

export function OrderLink({ order, children, className }: OrderLinkProps) {
  return (
    <Link 
      to={`/orders/${order.id}`}
      className={`text-primary hover:underline ${className}`}
    >
      #{order.number}
    </Link>
  )
} 