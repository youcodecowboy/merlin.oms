import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { Customer } from "@/lib/schema"

interface ConfirmationStageProps {
  form: UseFormReturn<any>
  customers: Customer[]
  onSubmit: (values: any) => Promise<void>
  onBack: () => void
}

export function ConfirmationStage({ 
  form, 
  customers,
  onSubmit,
  onBack 
}: ConfirmationStageProps) {
  const values = form.getValues()
  const customer = customers.find(c => c.id === values.customer_id)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
          <p className="text-sm">{customer?.email}</p>
          {customer?.name && (
            <p className="text-sm text-muted-foreground">{customer.name}</p>
          )}
          {customer?.phone && (
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Order Number</h3>
          <p className="text-sm font-mono">{values.number}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
          <div className="space-y-2">
            {values.items.map((item: any, index: number) => (
              <div key={index} className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">SKU: {item.sku}</p>
                    <p className="text-sm text-muted-foreground">
                      Style: {item.style}, Waist: {item.waist}, Shape: {item.shape}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Inseam: {item.inseam}, Wash: {item.wash}, Hem: {item.hem}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Quantity: {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={() => onSubmit(values)}
        >
          Create Order
        </Button>
      </div>
    </div>
  )
}