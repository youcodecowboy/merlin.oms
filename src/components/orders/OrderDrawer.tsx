import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, X, User } from "lucide-react"
import { OrderOverview } from './drawer/OrderOverview'
import { OrderTimeline } from './drawer/OrderTimeline'
import { CustomerProfileDrawer } from "@/components/customers/CustomerProfileDrawer"
import { InventoryItemDrawer } from "@/components/inventory/InventoryItemDrawer"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/schema"

interface OrderDrawerProps {
  order: Order | null
  open: boolean
  onClose: () => void
}

export function OrderDrawer({
  order,
  open,
  onClose
}: OrderDrawerProps) {
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null)
  const [inventoryDrawerOpen, setInventoryDrawerOpen] = useState(false)

  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting order:', order.id)
  }

  // Mock function to get customer status (in real app, this would come from your backend)
  const getCustomerStatus = () => {
    return { label: 'VIP', variant: 'success' as const }
  }

  const customerStatus = getCustomerStatus()

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-3xl lg:max-w-4xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="space-y-4 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-xl">
                      Order #{order.number}
                    </SheetTitle>
                    <Badge
                      variant={customerStatus.variant}
                      className={cn(
                        "h-6 px-2 text-xs",
                        customerStatus.variant === 'success' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}
                    >
                      {customerStatus.label}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setCustomerDrawerOpen(true)}
                    className="flex items-center gap-2 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1 -ml-1"
                  >
                    <User className="h-4 w-4" />
                    {order.customer?.name || 'Unnamed Customer'} ({order.customer?.email})
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      order.order_status === 'COMPLETED' ? 'success' :
                      order.order_status === 'CANCELLED' ? 'destructive' :
                      'warning'
                    }
                    className="h-6 px-2 text-xs"
                  >
                    {order.order_status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 overflow-auto py-4">
              <Tabs defaultValue="overview" className="h-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <OrderOverview 
                    order={order} 
                    onCustomerClick={() => setCustomerDrawerOpen(true)}
                    onInventoryItemClick={(item) => {
                      setSelectedInventoryItem(item)
                      setInventoryDrawerOpen(true)
                    }}
                  />
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <OrderTimeline 
                    order={order}
                    onInventoryItemClick={(item) => {
                      setSelectedInventoryItem(item)
                      setInventoryDrawerOpen(true)
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CustomerProfileDrawer
        customer={order.customer}
        open={customerDrawerOpen}
        onClose={() => setCustomerDrawerOpen(false)}
      />

      <InventoryItemDrawer
        item={selectedInventoryItem}
        open={inventoryDrawerOpen}
        onClose={() => {
          setInventoryDrawerOpen(false)
          setSelectedInventoryItem(null)
        }}
      />
    </>
  )
}