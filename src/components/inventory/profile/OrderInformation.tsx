import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderInformationProps {
  order: {
    id: string
    number: number
    customer: {
      name: string
      email: string
    }
  }
  onOrderClick?: () => void
  onCustomerClick?: () => void
}

export function OrderInformation({
  order,
  onOrderClick,
  onCustomerClick
}: OrderInformationProps) {
  // Mock data - in real app, fetch this from your API
  const otherItems = [
    { sku: 'ST-32-S-32-RAW', status: 'CUTTING' },
    { sku: 'SL-30-R-34-BLK', status: 'WASHING' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Order #{order.number}</h3>
            <button
              onClick={onCustomerClick}
              className="flex items-center gap-2 text-primary hover:underline mt-1"
            >
              <User className="h-4 w-4" />
              {order.customer.name} ({order.customer.email})
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={onOrderClick}>
            View Order
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Other Items in Order</h4>
          <div className="space-y-2">
            {otherItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <span className="font-mono text-sm">{item.sku}</span>
                <Badge
                  className={cn(
                    item.status === 'CUTTING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    item.status === 'WASHING' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  )}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}