import { useState } from 'react'
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Box, MapPin, Clock, X, MoveRight, User, CalendarClock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InventoryItem, Request } from '@/lib/schema'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/routes'
import { MoveItemDialog } from './MoveItemDialog'

const PRODUCTION_STAGES = [
  'PATTERN',
  'CUTTING',
  'SEWING',
  'WASHING',
  'QC',
  'FINISHING',
  'PACKING'
]

interface InventoryDrawerProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
  onRequestClick?: (request: Request) => void
  className?: string
}

export function InventoryDrawer({
  item,
  open,
  onClose,
  onRequestClick,
  className
}: InventoryDrawerProps) {
  const [showQR, setShowQR] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const navigate = useNavigate()

  if (!item) return null

  // Calculate production progress
  const completedStages = item.timeline?.filter(stage => stage.status === 'COMPLETED').length || 0
  const progress = (completedStages / PRODUCTION_STAGES.length) * 100

  // Get active request
  const activeRequest = item.requests?.find(r => 
    r.status === 'PENDING' || r.status === 'IN_PROGRESS'
  )

  // Helper to handle request clicks
  const handleRequestClick = (request: Request) => {
    navigate(`/requests/${request.id}`, {
      state: { from: `/inv/${item.id}` }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[95vw] max-w-[1920px] overflow-y-auto p-0">
        {/* Enhanced Sticky Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {/* Top Row - Main Info */}
          <div className="p-6 flex justify-between items-start">
            <div className="flex gap-6">
              {/* QR Code Section */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-20 w-20"
                  onClick={() => setShowQR(!showQR)}
                >
                  {showQR ? (
                    <QRCodeSVG value={item.id} size={72} />
                  ) : (
                    <Box className="h-8 w-8" />
                  )}
                </Button>
              </div>

              {/* Main Info Section */}
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{item.sku}</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => navigator.clipboard.writeText(item.sku)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {item.id}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge>{item.status1}</Badge>
                  <Badge variant="outline">{item.status2}</Badge>
                  {item.location && (
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {item.location}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Timestamps Section */}
              <div className="space-y-1 border-l pl-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  <span>Created: {new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  <span>Updated: {new Date(item.updated_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Section */}
              {item.order?.customer && (
                <div className="border-l pl-6">
                  <Button
                    variant="ghost"
                    className="h-auto p-2"
                    onClick={() => {
                      // Navigate to customer profile
                      navigate(`/customers/${item.order?.customer.id}`)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{item.order.customer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.order.customer.email}
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMoveDialog(true)}
              >
                <MoveRight className="h-4 w-4 mr-2" />
                Move Unit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bottom Row - Progress Bar */}
          <div className="px-6 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Production Progress</span>
                <span className="text-muted-foreground">
                  {completedStages} of {PRODUCTION_STAGES.length} stages completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Move Dialog */}
        <MoveItemDialog 
          open={showMoveDialog} 
          onOpenChange={setShowMoveDialog}
          item={item}
        />

        {/* Main Content - Tabs */}
        <div className="p-6">
          <Tabs defaultValue="active-request" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active-request">Active Request</TabsTrigger>
              <TabsTrigger value="details">Item Details</TabsTrigger>
              <TabsTrigger value="order">Order & Customer</TabsTrigger>
              <TabsTrigger value="history">Timeline & History</TabsTrigger>
            </TabsList>

            {/* Active Request Tab */}
            <TabsContent value="active-request">
              {activeRequest ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{activeRequest.request_type.replace('_', ' ')}</CardTitle>
                        <p className="text-sm text-muted-foreground">Request #{activeRequest.id}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleRequestClick(activeRequest)}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Request Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Steps Progress</span>
                        <span className="text-muted-foreground">
                          {activeRequest.steps?.filter(s => s.status === 'COMPLETED').length || 0}
                          {' / '}
                          {activeRequest.steps?.length || 0}
                          {' steps completed'}
                        </span>
                      </div>
                      <Progress 
                        value={
                          ((activeRequest.steps?.filter(s => s.status === 'COMPLETED').length || 0) /
                          (activeRequest.steps?.length || 1)) * 100
                        } 
                      />
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                      {activeRequest.steps?.map((step, index) => (
                        <div 
                          key={index}
                          className={cn(
                            "p-4 rounded-lg border",
                            step.status === 'COMPLETED' && "bg-primary/5 border-primary",
                            step.status === 'IN_PROGRESS' && "bg-warning/5 border-warning"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{step.title}</h4>
                            <Badge variant={
                              step.status === 'COMPLETED' ? 'default' :
                              step.status === 'IN_PROGRESS' ? 'secondary' :
                              'outline'
                            }>
                              {step.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      No active request
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Item Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Production Info</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batch ID</span>
                          <span>{item.batch_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabric Code</span>
                          <span>{item.fabric_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original SKU</span>
                          <span>{item.original_sku}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Dates</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Production Date</span>
                          <span>{item.production_date && new Date(item.production_date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order & Customer Tab */}
            <TabsContent value="order">
              <Card>
                <CardContent className="pt-6">
                  {item.order ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Order Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Number</span>
                            <span>#{item.order.number}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => item.order && navigate(ROUTES.ORDER(item.order.id))}
                            className="w-full"
                          >
                            View Order Details
                          </Button>
                        </div>
                      </div>

                      {item.order.customer && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Customer Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name</span>
                              <span>{item.order.customer.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email</span>
                              <span>{item.order.customer.email}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No order associated
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline & History Tab */}
            <TabsContent value="history">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Timeline */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Production Timeline</h4>
                    <div className="space-y-4">
                      {item.timeline?.map((stage) => (
                        <div 
                          key={stage.stage}
                          className={cn(
                            "p-4 rounded-lg border",
                            stage.status === 'COMPLETED' && "bg-primary/5 border-primary",
                            stage.status === 'IN_PROGRESS' && "bg-warning/5 border-warning"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{stage.stage}</h4>
                            <Badge variant={
                              stage.status === 'COMPLETED' ? 'default' :
                              stage.status === 'IN_PROGRESS' ? 'secondary' :
                              'outline'
                            }>
                              {stage.status}
                            </Badge>
                          </div>

                          {stage.requestId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => {
                                const request = item.requests?.find(r => r.id === stage.requestId)
                                if (request) {
                                  handleRequestClick(request)
                                }
                              }}
                            >
                              View Request #{stage.requestId}
                            </Button>
                          )}

                          {stage.completedAt && (
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3 mr-1" />
                              Completed {new Date(stage.completedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Event History</h4>
                    <div className="space-y-4">
                      {item.events?.map((event) => (
                        <div 
                          key={event.id}
                          className="border-l-2 pl-4 pb-4 last:pb-0 relative"
                        >
                          <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.event_name}</span>
                              <Badge variant="outline">{event.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.event_description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}