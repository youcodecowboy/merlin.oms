import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { InventoryItemLink } from "@/components/inventory/InventoryItemLink"
import { useOrderData } from '@/lib/hooks/useOrderData'
import { ArrowLeft, User, Tag, Package, Clock } from "lucide-react"
import { EventTimeline } from "@/components/events/EventTimeline"

export function Order() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const {
    order,
    customer,
    items,
    events,
    loading,
    error
  } = useOrderData(id)

  if (loading || !order) {
    return <PageLayout title="Loading..." />
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { title: 'Orders', href: '/orders' },
          { title: order.number }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{order.status}</Badge>
              <Badge variant="outline">
                Created {new Date(order.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{customer.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Customer ID</span>
                    <span className="text-sm font-mono">{customer.id}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No customer information available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge>{order.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Updated</span>
              <span className="text-sm">
                {new Date(order.updated_at).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <InventoryItemLink item={item} className="font-mono hover:underline" />
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.current_sku}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{item.status1}</Badge>
                    <Badge variant="outline">{item.status2}</Badge>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No items in this order
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Timeline */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Event History</CardTitle>
            <CardDescription>
              Track all events and status changes for this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventTimeline events={events} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
} 