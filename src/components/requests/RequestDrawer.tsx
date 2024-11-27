import { useState } from 'react'
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StepsCard } from "./StepsCard"
import { AlertTriangle, Clock, User } from "lucide-react"
import type { DBRequest } from '@/lib/schema/database'
import { mockDB } from '@/lib/mock-db/store'
import { useNavigate } from 'react-router-dom'
import { useToast } from "@/components/ui/use-toast"

interface RequestDrawerProps {
  request: DBRequest | null
  open: boolean
  onClose: () => void
}

export function RequestDrawer({ request, open, onClose }: RequestDrawerProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isCompleting, setIsCompleting] = useState(false)
  
  if (!request) return null

  // Get the inventory item
  const item = mockDB.inventory_items.find(i => i.id === request.item_id)
  if (!item) return null

  // Get order and customer
  const order = mockDB.orders.find(o => o.id === item.order_id)
  const customer = order ? mockDB.customers.find(c => c.id === order.customer_id) : null

  const handleCompleteRequest = async () => {
    try {
      setIsCompleting(true)

      // Check if all steps are completed
      const steps = request.metadata?.steps || []
      const allStepsCompleted = steps.every(step => step.status === 'COMPLETED')

      if (!allStepsCompleted) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please complete all steps before completing the request"
        })
        return
      }

      // Move item to assigned bin
      const binLocation = request.metadata?.assigned_bin
      if (!binLocation) {
        throw new Error('No bin assigned')
      }

      // Update item location
      const itemIndex = mockDB.inventory_items.findIndex(i => i.id === item.id)
      if (itemIndex > -1) {
        mockDB.inventory_items[itemIndex] = {
          ...mockDB.inventory_items[itemIndex],
          location: binLocation,
          updated_at: new Date().toISOString()
        }
      }

      // Remove the request
      const requestIndex = mockDB.requests.findIndex(r => r.id === request.id)
      if (requestIndex > -1) {
        mockDB.requests.splice(requestIndex, 1)
      }

      // Show success message
      toast({
        title: "Request Completed",
        description: `Item moved to ${binLocation}`
      })

      // Close drawer and navigate to wash page
      onClose()
      navigate('/wash')

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete request"
      })
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[80vw] max-w-[1920px] overflow-y-auto p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="p-6">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Wash Request</h2>
                <Badge>{request.priority}</Badge>
                <span className="text-sm text-muted-foreground">
                  #{request.id}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Due {request.metadata?.due_date ? 
                      new Date(request.metadata.due_date).toLocaleString() : 
                      'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Assigned to {request.metadata?.assigned_to || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {order && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    Order #{order.number}
                  </Button>
                )}
                {customer && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      {customer.name}
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">SKU:</span>
                <span className="text-sm font-mono">{item.current_sku}</span>
                <span className="text-muted-foreground mx-2">→</span>
                <span className="text-sm font-mono">{item.target_sku}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Item Information */}
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SKUs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Current SKU</label>
                    <div className="text-sm font-mono">{item.current_sku}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target SKU</label>
                    <div className="text-sm font-mono">{item.target_sku}</div>
                  </div>
                </div>

                {/* Order Information */}
                {order && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Order</label>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-mono"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        #{order.number}
                      </Button>
                    </div>
                    {customer && (
                      <div>
                        <label className="text-sm font-medium">Customer</label>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          {customer.name}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status 1</label>
                    <div><Badge>{item.status1}</Badge></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status 2</label>
                    <div><Badge variant="outline">{item.status2}</Badge></div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <div className="text-sm">{item.location || 'Not specified'}</div>
                </div>

                {/* Wash Details */}
                <div>
                  <label className="text-sm font-medium">Wash Type</label>
                  <div className="text-sm">{request.metadata?.wash_type}</div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due</label>
                    <div className="text-sm text-muted-foreground">
                      {request.metadata?.due_date ? 
                        new Date(request.metadata.due_date).toLocaleString() : 
                        'Not specified'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Steps */}
            <StepsCard request={request} />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => console.log('Report problem')}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Report a Problem
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteRequest}
                disabled={isCompleting}
              >
                {isCompleting ? 'Completing...' : 'Complete Request'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 