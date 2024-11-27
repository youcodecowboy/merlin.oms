import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { StatusBadge } from "@/components/status/StatusBadge"
import { EventTimeline } from "@/components/events/EventTimeline"
import { OrderLink } from "@/components/orders/OrderLink"
import { QRCodeSVG } from 'qrcode.react'
import { 
  ArrowLeft, 
  Download, 
  Package, 
  User, 
  Tag, 
  MapPin, 
  Clock,
  ArrowRight
} from "lucide-react"
import { useInventoryItemData } from '@/lib/hooks/useInventoryItemData'

export function InventoryItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const {
    item,
    order,
    customer,
    events,
    loading,
    error
  } = useInventoryItemData(id)

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `item-${item?.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getQRValue = (itemId: string) => {
    return `${window.location.origin}/inv/${itemId}`
  }

  if (loading || !item) {
    return <PageLayout title="Loading..." />
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { title: 'Inventory', href: '/inv' },
          { title: item.id }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/inv')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-mono">{item.id}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={item.status1} type="item1" />
              <StatusBadge status={item.status2} type="item2" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                Scan to view item details - ID: {item.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCodeSVG 
                id="qr-code"
                value={getQRValue(item.id)}
                size={200}
                includeMargin
              />
              <div className="mt-2 text-sm text-muted-foreground">
                {getQRValue(item.id)}
              </div>
              <Button 
                variant="outline" 
                onClick={handleDownloadQR}
                className="mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>

          {/* SKU Information */}
          <Card>
            <CardHeader>
              <CardTitle>SKU Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current SKU</label>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm">{item.current_sku}</code>
                </div>
              </div>
              {item.target_sku && (
                <div>
                  <label className="text-sm font-medium">Target SKU</label>
                  <div className="flex items-center gap-2 mt-1">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <code className="text-sm">{item.target_sku}</code>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.location || 'No location set'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {customer.tags?.map(tag => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {order && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Order</span>
                      <OrderLink order={order} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {item.status2 === 'ASSIGNED' 
                      ? 'Loading customer information...'
                      : 'No customer assigned'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">
                  {new Date(item.updated_at).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Event History */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
              <CardDescription>
                Track all events and status changes for this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventTimeline events={events} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
} 