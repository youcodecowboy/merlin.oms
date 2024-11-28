import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { findMatchingSKU } from '@/lib/utils/sku-matching'
import { handleOrderAssignment } from '@/lib/utils/order-assignment'
import { updateOrderStatus } from '@/lib/utils/status-updates'
import { addToWaitlist } from '@/lib/utils/waitlist'
import { createProductionRequest } from '@/lib/utils/production'
import type { Order, SKU, InventoryItem } from '@/lib/types'

export function Orders() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [processingOrder, setProcessingOrder] = useState(false)
  const { toast } = useToast()

  const handleOrderCreated = async (order: Order, targetSKU: SKU) => {
    setProcessingOrder(true)
    try {
      // 1. Search for exact UNCOMMITTED match
      let match = await findMatchingSKU({
        targetSKU,
        type: 'exact',
        status2: 'UNCOMMITTED'
      })

      // 2. If no exact match, try universal match
      if (!match) {
        match = await findMatchingSKU({
          targetSKU,
          type: 'universal',
          status2: 'UNCOMMITTED'
        })
      }

      if (match) {
        // Found matching inventory
        if (match.status1 === 'STOCK') {
          // Direct assignment
          await handleOrderAssignment({
            order,
            item: match,
            assignmentType: 'direct'
          })
          
          await updateOrderStatus({
            orderId: order.id,
            status: 'PROCESSING',
            metadata: {
              assignedItem: match.id,
              assignmentType: 'direct'
            }
          })

          toast({
            title: "Order Assigned",
            description: "Found matching item in stock"
          })

        } else if (match.status1 === 'PRODUCTION') {
          // Add to waitlist
          await addToWaitlist({
            order,
            sku: match.sku,
            position: 'end'
          })

          await updateOrderStatus({
            orderId: order.id,
            status: 'WAITLISTED',
            metadata: {
              waitlistedSKU: match.sku,
              waitlistPosition: await getWaitlistPosition(order.id)
            }
          })

          toast({
            title: "Order Waitlisted",
            description: "Added to production waitlist"
          })
        }

      } else {
        // No match found - create production request
        const productionSKU = getUniversalSKU(targetSKU)
        await createProductionRequest({
          sku: productionSKU,
          order,
          quantity: 1
        })

        await updateOrderStatus({
          orderId: order.id,
          status: 'PENDING_PRODUCTION',
          metadata: {
            productionSKU: productionSKU
          }
        })

        toast({
          title: "Production Request Created",
          description: "No matching inventory found"
        })
      }

    } catch (error) {
      console.error('Error processing order:', error)
      toast({
        variant: "destructive",
        title: "Error Processing Order",
        description: "Please try again or contact support"
      })
    } finally {
      setProcessingOrder(false)
      setShowCreateDialog(false)
    }
  }

  return (
    <PageLayout title="Orders">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          disabled={processingOrder}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      <OrdersTable />

      <CreateOrderDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleOrderCreated}
        processing={processingOrder}
      />
    </PageLayout>
  )
}

// Helper functions
async function getWaitlistPosition(orderId: string): Promise<number> {
  // Implementation to get waitlist position
  return 0
}

function getUniversalSKU(targetSKU: SKU): SKU {
  // Implementation to convert target SKU to universal SKU (RAW/BRW)
  return targetSKU
}