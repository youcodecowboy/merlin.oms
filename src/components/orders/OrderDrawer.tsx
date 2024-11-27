import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, X, User, Box, Clock, AlertTriangle } from "lucide-react"
import { OrderOverview } from './drawer/OrderOverview'
import { OrderTimeline } from './drawer/OrderTimeline'
import { CustomerProfileDrawer } from "@/components/customers/CustomerProfileDrawer"
import { InventoryItemDrawer } from "@/components/inventory/InventoryItemDrawer"
import { RequestDrawer } from "@/components/requests/RequestDrawer"
import { cn } from "@/lib/utils"
import type { Order, Request, InventoryItem } from "@/lib/schema"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

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
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [inventoryDrawerOpen, setInventoryDrawerOpen] = useState(false)
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false)

  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    console.log('Exporting order:', order.id)
  }

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request)
    setRequestDrawerOpen(true)
  }

  const handleInventoryItemClick = (item: InventoryItem) => {
    setSelectedInventoryItem(item)
    setInventoryDrawerOpen(true)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[95vw] max-w-[1920px] overflow-y-auto p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="space-y-4 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-xl">
                      Order #{order.number}
                    </SheetTitle>
                    <Badge variant="outline">
                      {order.order_status}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setCustomerDrawerOpen(true)}
                    className="flex items-center gap-2 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1 -ml-1"
                  >
                    <User className="h-4 w-4" />
                    {order.customer?.name || 'Unnamed Customer'} ({order.customer?.email})
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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

            <Tabs defaultValue="overview" className="p-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OrderOverview order={order} />
              </TabsContent>

              <TabsContent value="items">
                <OrderTimeline order={order} />
              </TabsContent>

              <TabsContent value="waitlist">
                <Card>
                  <CardHeader>
                    <CardTitle>Waitlist Status</CardTitle>
                    <CardDescription>
                      Items waiting for production or inventory availability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {order.waitlist_entries && order.waitlist_entries.length > 0 ? (
                      <div className="space-y-4">
                        {order.waitlist_entries.map((entry) => (
                          <Card key={entry.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{entry.sku}</span>
                                  <Badge variant="outline">
                                    Position: {entry.position}
                                  </Badge>
                                  <Badge variant={entry.priority === 'URGENT' ? 'destructive' : 'default'}>
                                    {entry.priority}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Waiting for: {entry.raw_sku}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Added {new Date(entry.created_at).toLocaleString()}
                                </div>
                              </div>
                              {entry.position === 1 && (
                                <Badge variant="secondary">Next in Line</Badge>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No items currently on waitlist
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                {/* Events */}
                {order.events && order.events.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Event History</h3>
                    <div className="space-y-4">
                      {order.events.map((event) => (
                        <div
                          key={event.id}
                          className="bg-muted/50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{event.event_type}</div>
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

      <RequestDrawer
        request={selectedRequest}
        open={requestDrawerOpen}
        onClose={() => {
          setRequestDrawerOpen(false)
          setSelectedRequest(null)
        }}
      />
    </>
  )
}