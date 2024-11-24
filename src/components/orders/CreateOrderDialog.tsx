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
import type { Customer } from '@/lib/schema'

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
  baseInseam: number // Original inseam before hem adjustment
}

export function CreateOrderDialog({
  open,
  onClose,
  onSuccess
}: CreateOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<OrderStep>('customer')
  const { toast } = useToast()

  // Order data
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderNumber, setOrderNumber] = useState<number | null>(null)

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCurrentStep('product')
  }

  const handleProductSelect = (item: OrderItem) => {
    // Adjust inseam based on hem type
    const hemAdjustments = {
      'SND': 0,
      'RAW': 0,
      'ORL': 2,
      'HRL': 4
    }
    
    const adjustedItem = {
      ...item,
      baseInseam: item.inseam, // Store original inseam
      inseam: item.inseam + hemAdjustments[item.hem]
    }

    setOrderItems(prev => [...prev, adjustedItem])
    setCurrentStep('summary')
  }

  const handleCreateOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) return

    try {
      setLoading(true)

      // Create the order
      const order = await createMockOrder({
        customer_id: selectedCustomer.id!,
        customer: selectedCustomer,
        items: orderItems.map(item => ({
          ...item,
          // Construct SKU with adjusted inseam
          sku: `${item.style}-${item.waist}-${item.shape}-${item.inseam}-${item.wash}`
        }))
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

  const handleClose = () => {
    setCurrentStep('customer')
    setSelectedCustomer(null)
    setOrderItems([])
    setOrderNumber(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              onBack={() => setCurrentStep('customer')}
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