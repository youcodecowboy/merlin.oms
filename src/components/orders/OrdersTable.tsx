import { useState } from 'react'
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
import { User } from "lucide-react"
import { CustomerProfileDrawer } from "@/components/customers/CustomerProfileDrawer"
import { OrderDrawer } from "@/components/orders/OrderDrawer"
import { cn } from "@/lib/utils"
import type { Order, OrderItem } from "@/lib/schema"

interface OrdersTableProps {
  orders: Order[]
}

// Helper function to expand order items into individual units
function expandOrderItems(items: OrderItem[]): OrderItem[] {
  return items.flatMap(item => 
    Array.from({ length: item.quantity }, (_, index) => ({
      ...item,
      id: `${item.id}-${index + 1}`,
      quantity: 1,
      unit: index + 1
    }))
  )
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Order['customer'] | null>(null)
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.flatMap((order) => {
            const expandedItems = expandOrderItems(order.items || [])
            
            return expandedItems.map((item, index) => (
              <TableRow 
                key={`${order.id}-${item.id}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedOrder(order)
                  setOrderDrawerOpen(true)
                }}
              >
                {index === 0 && (
                  <>
                    <TableCell 
                      className="font-mono" 
                      rowSpan={expandedItems.length}
                    >
                      {order.number}
                    </TableCell>
                    <TableCell rowSpan={expandedItems.length}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCustomer(order.customer)
                          setCustomerDrawerOpen(true)
                        }}
                        className="flex items-center gap-2 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                      >
                        <User className="h-4 w-4" />
                        {order.customer?.email}
                      </button>
                    </TableCell>
                  </>
                )}
                <TableCell>Unit {item.unit}</TableCell>
                <TableCell className="font-mono">{item.sku}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    {
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': 
                        item.status === 'COMMITTED',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': 
                        item.status === 'PENDING',
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': 
                        item.status === 'PARTIALLY_COMMITTED',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': 
                        item.status === 'PENDING_PRODUCTION'
                    }
                  )}>
                    {item.status.toLowerCase()}
                  </span>
                </TableCell>
                {index === 0 && (
                  <>
                    <TableCell rowSpan={expandedItems.length}>
                      {new Date(order.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell rowSpan={expandedItems.length}>
                      {new Date(order.updated_at).toLocaleString()}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          })}
        </TableBody>
      </Table>

      <CustomerProfileDrawer
        customer={selectedCustomer}
        open={customerDrawerOpen}
        onClose={() => {
          setCustomerDrawerOpen(false)
          setSelectedCustomer(null)
        }}
      />

      <OrderDrawer
        order={selectedOrder}
        open={orderDrawerOpen}
        onClose={() => {
          setOrderDrawerOpen(false)
          setSelectedOrder(null)
        }}
      />
    </>
  )
}