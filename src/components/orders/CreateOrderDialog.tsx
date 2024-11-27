import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createMockOrder } from '@/lib/mock-api/orders'
import { CustomerSelect } from './CustomerSelect'
import { ProductSelect } from './ProductSelect'
import OrderSummary from './OrderSummary'
import type { Customer, Product } from '@/lib/schema'

interface CreateOrderDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type OrderStep = 'customer' | 'product' | 'summary'

interface OrderItem {
  sku: string
  style: string
  waist: number
  shape: string
  inseam: number
  wash: string
  hem: 'SND' | 'RAW' | 'ORL' | 'HRL'
  quantity: number
  baseInseam: number
}

export function CreateOrderDialog({
  open,
  onClose,
  onSuccess
}: CreateOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<OrderStep>('customer')
  const { toast } = useToast()

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCurrentStep('product')
  }

  const handleProductSelect = (product: Product) => {
    if (!product?.sku) {
      toast({
        title: "Error",
        description: "Invalid product selection - missing SKU",
        variant: "destructive",
      })
      return
    }

    // Validate SKU format
    const skuParts = product.sku.split('-')
    if (skuParts.length !== 5) {
      toast({
        title: "Error",
        description: "Invalid SKU format - must be style-waist-shape-inseam-wash",
        variant: "destructive",
      })
      return
    }

    const [style, waist, shape, inseam, wash] = skuParts
    if (!style || !waist || !shape || !inseam || !wash) {
      toast({
        title: "Error",
        description: "Invalid SKU format - missing components",
        variant: "destructive",
      })
      return
    }

    const orderItem: OrderItem = {
      sku: product.sku,
      style,
      waist: parseInt(waist),
      shape,
      inseam: parseInt(inseam),
      wash,
      hem: 'SND',
      quantity: 1,
      baseInseam: parseInt(inseam)
    }

    setOrderItems(prev => [...prev, orderItem])
    setCurrentStep('summary')
  }

  const handleCreateOrder = async () => {
    if (!selectedCustomer?.id || orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select a customer and add items to the order",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const order = await createMockOrder({
        customer_id: selectedCustomer.id,
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          email: selectedCustomer.email
        },
        items: orderItems
      })

      toast({
        title: "Order Created",
        description: `Order #${order.number} has been created successfully`,
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create order:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'customer' && "Select Customer"}
            {currentStep === 'product' && "Add Products"}
            {currentStep === 'summary' && "Order Summary"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 'customer' && (
            <CustomerSelect 
              onSelect={handleCustomerSelect}
              selectedCustomer={selectedCustomer}
            />
          )}

          {currentStep === 'product' && (
            <ProductSelect
              onSelect={handleProductSelect}
            />
          )}

          {currentStep === 'summary' && (
            <OrderSummary
              customer={selectedCustomer!}
              items={orderItems}
              onAddMore={() => setCurrentStep('product')}
              onBack={() => setCurrentStep('product')}
              onSubmit={handleCreateOrder}
              loading={loading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}