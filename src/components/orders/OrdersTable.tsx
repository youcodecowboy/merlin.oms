import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockDB } from '@/lib/mock-db/store'
import { formatDate } from '@/lib/utils/date'

export function OrdersTable() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState(mockDB.orders || [])

  // Refresh orders when mockDB changes
  useEffect(() => {
    setOrders(mockDB.orders || [])
  }, [mockDB.orders])

  const handleViewOrder = (orderNumber: string) => {
    navigate(`/orders/${orderNumber}`)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? (
          orders.map((order) => {
            const orderItems = mockDB.order_items?.filter(item => item.order_id === order.id) || []
            
            return (
              <TableRow 
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewOrder(order.number)}
              >
                <TableCell className="font-mono">{order.number}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === 'PRODUCTION' ? 'destructive' :
                    order.status === 'PROCESSING' ? 'default' :
                    'secondary'
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{orderItems.length} items</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewOrder(order.number)
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              No orders found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}