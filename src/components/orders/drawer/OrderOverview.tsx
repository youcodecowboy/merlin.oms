import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Order } from '@/lib/schema'

interface OrderOverviewProps {
  order: Order
}

export function OrderOverview({ order }: OrderOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div>
        <h3 className="text-lg font-medium">Order #{order.number}</h3>
        <p className="text-sm text-muted-foreground">
          Created {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      {/* Customer Info */}
      <div>
        <h4 className="text-sm font-medium mb-2">Customer</h4>
        {order.customer ? (
          <div className="space-y-1">
            <p className="text-sm">{order.customer.name}</p>
            {order.customer.email && (
              <p className="text-sm text-muted-foreground">{order.customer.email}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No customer information</p>
        )}
      </div>

      <Separator />

      {/* Order Items */}
      <div>
        <h4 className="text-sm font-medium mb-4">Items</h4>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.sku}</p>
                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
              </div>
              {item.status && (
                <Badge variant="outline">{item.status}</Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Order Status */}
      <div>
        <h4 className="text-sm font-medium mb-2">Status</h4>
        <Badge>{order.status}</Badge>
      </div>
    </div>
  )
}