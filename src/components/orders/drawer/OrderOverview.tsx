import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QRCodeDownload } from "@/components/QRCodeDownload"
import { format, addDays } from 'date-fns'
import { User, Phone, Mail, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockStore } from "@/lib/mock/store"
import type { Order, OrderItem } from "@/lib/schema"

interface OrderOverviewProps {
  order: Order
  onCustomerClick: () => void
  onInventoryItemClick: (item: any) => void
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

export function OrderOverview({
  order,
  onCustomerClick,
  onInventoryItemClick
}: OrderOverviewProps) {
  // Get committed inventory items for this order
  const orderInventoryItems = mockStore.inventory.filter(item => 
    item.orderId === order.id
  )

  // Expected delivery calculation based on order status
  const expectedDelivery = addDays(new Date(order.created_at), 14)
  const paymentStatus = 'PAID'
  const shippingMethod = 'Standard Shipping'

  // Get active requests for this order
  const activeRequests = mockStore.pendingProduction
    .filter(req => req.orderId === order.id)
    .map(req => ({
      id: req.id,
      item: req.sku,
      status: req.status,
      priority: req.priority
    }))

  // Expand order items into individual units
  const expandedItems = expandOrderItems(order.items || [])

  return (
    <div className="space-y-6">
      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Order Date</label>
            <div className="mt-1">{format(new Date(order.created_at), 'PPp')}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
            <div className="mt-1">{format(expectedDelivery, 'PP')}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
            <div className="mt-1">
              <Badge variant={paymentStatus === 'PAID' ? 'success' : 'warning'}>
                {paymentStatus}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Shipping Method</label>
            <div className="mt-1">{shippingMethod}</div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer?.name || 'Unnamed Customer'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer?.email}</span>
              </div>
              {order.customer?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onCustomerClick}>
              View Profile
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Requests */}
      {activeRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{request.item}</div>
                    <div className="text-sm text-muted-foreground">{request.status}</div>
                  </div>
                  <Badge
                    className={cn(
                      request.priority === 'HIGH' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                      request.priority === 'MEDIUM' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    )}
                  >
                    {request.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Units</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expandedItems.map((item) => {
              // Find committed inventory item for this unit
              const inventoryItem = orderInventoryItems[item.unit - 1]
              const isPending = !inventoryItem

              return (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onInventoryItemClick(inventoryItem || item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">Unit {item.unit}</div>
                      <div className="text-sm font-mono text-muted-foreground">{item.sku}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {inventoryItem?.qr_code && (
                        <QRCodeDownload
                          qrCode={inventoryItem.qr_code}
                          fileName={`qr-${item.sku}-${item.unit}`}
                          variant="ghost"
                          size="sm"
                          showIcon
                        />
                      )}
                      <Badge>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <label className="text-muted-foreground">Production Stage</label>
                      <div className="mt-1 font-medium">
                        {isPending ? 'PENDING' : inventoryItem?.status1}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Status</label>
                      <div className="mt-1 font-medium">
                        {isPending ? 'PENDING' : inventoryItem?.status2}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground">ETA</label>
                      <div className="mt-1 font-medium">
                        {isPending ? 'TBD' : format(addDays(new Date(), 7), 'PP')}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}