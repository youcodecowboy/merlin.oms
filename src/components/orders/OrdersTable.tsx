import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { OrderLink } from './OrderLink'
import type { DBOrder } from '@/lib/schema/database'

interface OrdersTableProps {
  data: DBOrder[]
  loading?: boolean
}

export function OrdersTable({ data = [], loading }: OrdersTableProps) {
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <OrderLink order={order} />
            </TableCell>
            <TableCell>
              <Badge>{order.status}</Badge>
            </TableCell>
            <TableCell>{order.customer_name}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              No orders found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}