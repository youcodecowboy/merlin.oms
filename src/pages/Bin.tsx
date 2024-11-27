import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { QRCodeSVG } from 'qrcode.react'
import { 
  ArrowLeft, 
  Package, 
  Download,
  Clock,
  BoxSelect,
  ArrowRight,
  Plus
} from "lucide-react"
import { InventoryItemLink } from '@/components/inventory/InventoryItemLink'
import { BinCapacityIndicator } from '@/components/bins/BinCapacityIndicator'
import { AddItemToBinDialog } from '@/components/bins/AddItemToBinDialog'
import { useBinData } from '@/lib/hooks/useBinData'

export function Bin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const { bin, items, loading, error } = useBinData(id)

  const handleItemClick = (itemId: string) => {
    navigate(`/inv/${itemId}`)
  }

  const renderSlots = () => {
    const slots = []
    for (let i = 0; i < (bin?.capacity || 0); i++) {
      const item = items[i]
      slots.push(
        <div 
          key={i}
          className={`flex items-center justify-between p-4 border rounded-lg bg-card ${
            item ? 'hover:bg-muted/50 cursor-pointer' : ''
          }`}
          onClick={() => item && handleItemClick(item.id)}
        >
          {item ? (
            <>
              <div className="flex items-center gap-4">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{item.id}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{item.current_sku}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Click to view item details
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Added {new Date(item.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="h-4 w-4 border-2 border-dashed rounded-full" />
              <span>Available Slot {i + 1}</span>
            </div>
          )}
        </div>
      )
    }
    return slots
  }

  if (loading || !bin) {
    return <PageLayout title="Loading..." />
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { title: 'Inventory', href: '/inv' },
          { title: 'Bins', href: '/inv?tab=bins' },
          { title: bin.id }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/inv?tab=bins')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-mono">{bin.id}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">Zone {bin.zone}</Badge>
              <Badge variant="outline">Rack {bin.rack}</Badge>
              <Badge variant="outline">Shelf {bin.shelf}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAddItemDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>Bin QR Code</CardTitle>
              <CardDescription>Scan to view bin details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCodeSVG 
                id="bin-qr-code"
                value={`${window.location.origin}/bins/${bin.id}`}
                size={200}
                includeMargin
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  const canvas = document.getElementById('bin-qr-code') as HTMLCanvasElement
                  if (!canvas) return
                  const url = canvas.toDataURL('image/png')
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `bin-${bin?.id}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Bin Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Bin Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BinCapacityIndicator bin={bin} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Space</span>
                <span>{bin.capacity - bin.current_items} slots</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Items List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bin Slots</CardTitle>
                <CardDescription>
                  {bin.current_items} of {bin.capacity} slots in use
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderSlots()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddItemToBinDialog
        bin={bin}
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </PageLayout>
  )
} 