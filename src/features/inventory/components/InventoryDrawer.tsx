import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveRequest } from '../hooks/useActiveRequest'
import { useOrderData } from '../hooks/useOrderData'
import { useInventoryRequests } from '../hooks/useInventoryRequests'
import { useInventoryMetadata } from '../hooks/useInventoryMetadata'
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Box, MapPin, Clock, X, MoveRight, User, CalendarClock, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROUTES } from '@/lib/constants/routes'
import type { InventoryDrawerProps, ProductionStage } from '../types'
import { PRODUCTION_STAGES } from '../constants'
import { useToast } from '@/components/ui/use-toast'

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
  const { toast } = useToast()

  // Get active request data
  const {
    request: activeRequest,
    loading: requestLoading,
    error: requestError,
    refresh: refreshRequest
  } = useActiveRequest(item?.id || '')

  // Get order and customer data
  const {
    order,
    customer,
    loading: orderLoading,
    error: orderError,
    refresh: refreshOrder
  } = useOrderData(item?.id || '')

  // Get all requests
  const {
    allRequests,
    loading: requestsLoading,
    error: requestsError,
    refresh: refreshRequests
  } = useInventoryRequests(item?.id || '')

  // Get metadata
  const {
    events,
    timeline,
    loading: metadataLoading,
    error: metadataError,
    refresh: refreshMetadata
  } = useInventoryMetadata(item?.id || '')

  if (!item) return null

  const handleRequestClick = (request: Request) => {
    if (!request?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid request data"
      })
      return
    }

    if (onRequestClick) {
      onRequestClick(request)
    } else {
      navigate(`/requests/${request.id}`, {
        state: { from: `/inv/${item.id}` }
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className={cn("w-[95vw] max-w-[1920px] overflow-y-auto p-0", className)}>
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {/* Main Info */}
          <div className="p-6 flex justify-between items-start">
            <div className="flex gap-6">
              {/* QR Code */}
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

              {/* Item Details */}
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{item.sku}</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(item.sku)}
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

              {/* Timestamps */}
              <div className="space-y-1 border-l pl-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  <span>Created: {formatDate(item.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  <span>Updated: {formatDate(item.updated_at)}</span>
                </div>
              </div>

              {/* Customer Info */}
              {item.order?.customer && (
                <div className="border-l pl-6">
                  <Button
                    variant="ghost"
                    className="h-auto p-2"
                    onClick={() => item.order?.customer?.id && 
                      navigate(`/customers/${item.order.customer.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">
                          {item.order.customer.name}
                        </div>
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

          {/* Progress Bar */}
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

        {/* Content Tabs */}
        <div className="p-6">
          <Tabs defaultValue="active-request" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active-request">
                Active Request
                {activeRequest && (
                  <Badge variant="secondary" className="ml-2">
                    {activeRequest.request_type}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="details">Item Details</TabsTrigger>
              <TabsTrigger value="order">
                Order & Customer
                {order && (
                  <Badge variant="secondary" className="ml-2">
                    #{order.number}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">Timeline & History</TabsTrigger>
            </TabsList>

            {/* Active Request Tab */}
            <TabsContent value="active-request">
              {requestLoading ? (
                <LoadingCard />
              ) : requestError ? (
                <ErrorCard message={requestError} />
              ) : activeRequest ? (
                <ActiveRequestCard 
                  request={activeRequest}
                  onViewClick={() => handleRequestClick(activeRequest)}
                />
              ) : (
                <EmptyCard message="No active request" />
              )}
            </TabsContent>

            {/* Order Tab */}
            <TabsContent value="order">
              {orderLoading ? (
                <LoadingCard />
              ) : orderError ? (
                <ErrorCard message={orderError} />
              ) : order ? (
                <OrderDetailsCard 
                  order={order}
                  customer={customer}
                  onOrderClick={() => navigate(`/orders/${order.id}`)}
                  onCustomerClick={() => customer && navigate(`/customers/${customer.id}`)}
                />
              ) : (
                <EmptyCard message="No order associated" />
              )}
            </TabsContent>

            {/* Timeline & History Tab */}
            <TabsContent value="history">
              {metadataLoading ? (
                <LoadingCard />
              ) : metadataError ? (
                <ErrorCard message={metadataError} />
              ) : (
                <div className="space-y-6">
                  {/* Timeline Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Production Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {timeline.map((stage) => (
                        <TimelineStageCard 
                          key={stage.stage}
                          stage={stage}
                          onRequestClick={handleRequestClick}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  {/* Events Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Event History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {events.map((event) => (
                          <EventCard 
                            key={event.id}
                            event={event}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
} 