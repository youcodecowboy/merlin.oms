import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"

interface Order {
  id: string
  number: number
  status: string
  date: string
  items: {
    sku: string
    quantity: number
  }[]
  total: number
}

interface CustomerOrdersProps {
  customerId: string
}

export function CustomerOrders({ customerId }: CustomerOrdersProps) {
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [pastOrders, setPastOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockActiveOrders = [{
        id: '1',
        number: 1001,
        status: 'PROCESSING',
        date: '2024-01-15T10:00:00Z',
        items: [
          { sku: 'ST-32-S-32-RAW', quantity: 1 },
          { sku: 'SL-30-R-34-BLK', quantity: 2 }
        ],
        total: 399.98
      }]

      const mockPastOrders = [{
        id: '2',
        number: 1000,
        status: 'COMPLETED',
        date: '2024-01-01T10:00:00Z',
        items: [
          { sku: 'ST-32-S-32-RAW', quantity: 1 }
        ],
        total: 199.99
      }]

      setActiveOrders(mockActiveOrders)
      setPastOrders(mockPastOrders)
      setLoading(false)
    }
    fetchOrders()
  }, [customerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
      </div>
    )
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold">Order #{order.number}</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.date), 'PPp')}
            </p>
          </div>
          <Badge
            className={cn(
              "px-2 py-1",
              order.status === 'PROCESSING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
              order.status === 'COMPLETED' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            )}
          >
            {order.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="font-mono">{item.sku}</span>
              <span>x{item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="ml-2 font-semibold">
              ${order.total.toFixed(2)}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Active Orders */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Active Orders</h3>
        {activeOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active orders</p>
        ) : (
          activeOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>

      {/* Past Orders */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Past Orders</h3>
        {pastOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past orders</p>
        ) : (
          pastOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}