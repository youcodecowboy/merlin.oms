import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import type { Customer } from '@/lib/schema'

interface OrderSummaryProps {
  customer: Customer
  items: Array<{
    sku: string
    style: string
    waist: number
    shape: string
    inseam: number
    wash: string
    hem: 'SND' | 'RAW' | 'ORL' | 'HRL'
    quantity: number
    baseInseam: number
  }>
  onAddMore: () => void
  onBack: () => void
  onSubmit: () => void
  loading: boolean
}

export default function OrderSummary({
  customer,
  items,
  onAddMore,
  onBack,
  onSubmit,
  loading
}: OrderSummaryProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h3 className="text-lg font-medium">Order Summary</h3>
      </div>

      {/* Customer Information */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Customer</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Order Items</h4>
          <p className="text-sm text-muted-foreground">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} total
          </p>
        </div>
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4 space-y-4">
            {items.map((item, index) => (
              <div 
                key={index}
                className="p-3 bg-muted/30 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono">{item.sku}</span>
                  <span className="text-sm">× {item.quantity}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span>Style: </span>
                    <span className="font-medium text-foreground">{item.style}</span>
                  </div>
                  <div>
                    <span>Waist: </span>
                    <span className="font-medium text-foreground">{item.waist}"</span>
                  </div>
                  <div>
                    <span>Shape: </span>
                    <span className="font-medium text-foreground">{item.shape}</span>
                  </div>
                  <div>
                    <span>Base Inseam: </span>
                    <span className="font-medium text-foreground">{item.baseInseam}"</span>
                  </div>
                  <div>
                    <span>Final Inseam: </span>
                    <span className="font-medium text-foreground">{item.inseam}"</span>
                  </div>
                  <div>
                    <span>Hem: </span>
                    <span className="font-medium text-foreground">{item.hem}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={onAddMore}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add More Items
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={loading || items.length === 0}
          className="min-w-[120px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Order'
          )}
        </Button>
      </div>
    </div>
  )
}

export { OrderSummary } 