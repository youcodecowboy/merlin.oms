import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getMockInventoryEvents } from '@/lib/mock-api/events'
import { getMockOrder } from '@/lib/mock-api/orders'
import type { InventoryItem, InventoryEvent, Order } from '@/lib/schema'

interface Props {
  item: InventoryItem
}

export function InventoryItemDetails({ item }: Props) {
  const [events, setEvents] = useState<InventoryEvent[]>([])
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      const itemEvents = await getMockInventoryEvents(item.id)
      setEvents(itemEvents)
    }

    const loadOrder = async () => {
      if (item.order_id) {
        const orderData = await getMockOrder(item.order_id)
        setOrder(orderData || null)
      }
    }

    loadEvents()
    loadOrder()
  }, [item.id, item.order_id])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span>SKU:</span>
              <span>{item.sku}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <div className="space-x-2">
                <Badge>{item.status1}</Badge>
                <Badge variant={item.status2 === 'UNCOMMITTED' ? 'outline' : 'default'}>
                  {item.status2}
                </Badge>
              </div>
            </div>
            {item.active_stage && (
              <div className="flex justify-between">
                <span>Active Stage:</span>
                <Badge variant="secondary">{item.active_stage}</Badge>
              </div>
            )}
            {item.customer_info && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Customer Information</h4>
                <div className="grid gap-1">
                  <div>Name: {item.customer_info.name}</div>
                  <div>Email: {item.customer_info.email}</div>
                </div>
              </div>
            )}
            {order && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Order Information</h4>
                <div className="grid gap-1">
                  <div>Order #: {order.number}</div>
                  <div>Status: {order.order_status}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between">
                  <span className="font-medium">{event.event_name}</span>
                  <Badge variant={event.status === 'COMPLETED' ? 'default' : 'outline'}>
                    {event.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{event.event_description}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 