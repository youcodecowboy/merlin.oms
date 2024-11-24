import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { QRCodeDownload } from "@/components/QRCodeDownload"
import { ActiveRequestCard } from "@/components/inventory/profile/ActiveRequestCard"
import { EventsTimeline } from "@/components/inventory/profile/EventsTimeline"
import { FinishingInstructions } from "@/components/inventory/profile/FinishingInstructions"
import { OrderInformation } from "@/components/inventory/profile/OrderInformation"
import { LogEventDialog } from "@/components/inventory/profile/LogEventDialog"
import { LogDefectDialog } from "@/components/inventory/profile/LogDefectDialog"
import { cn } from "@/lib/utils"

interface InventoryItemProfileProps {
  itemId: string
}

export function InventoryItemProfile({ itemId }: InventoryItemProfileProps) {
  const [logEventOpen, setLogEventOpen] = useState(false)
  const [logDefectOpen, setLogDefectOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string>()

  useEffect(() => {
    // Generate QR code when component mounts
    const generateQR = async () => {
      try {
        const QRCode = (await import('qrcode')).default
        const code = await QRCode.toDataURL(itemId)
        setQrCode(code)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }
    generateQR()
  }, [itemId])

  // Mock data - in real app, fetch this from your API
  const item = {
    id: itemId,
    sku: 'ST-32-S-32-RAW',
    status1: 'WASH',
    status2: 'ASSIGNED',
    qr_code: qrCode,
    order: {
      id: '1',
      number: 1001,
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Status Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-mono">{item.sku}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  STATUS 1: {item.status1}
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Status 1 indicates the current production stage</span>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  STATUS 2: {item.status2}
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Status 2 indicates the assignment status</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Request - Full Width */}
        <ActiveRequestCard itemId={itemId} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setLogEventOpen(true)}
          >
            Log Manual Event
          </Button>
          <Button
            variant="destructive"
            onClick={() => setLogDefectOpen(true)}
          >
            Log Defect
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* QR Code Card */}
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                {qrCode && (
                  <>
                    <img 
                      src={qrCode} 
                      alt="QR Code"
                      className="w-48 h-48 border rounded-lg shadow-sm"
                    />
                    <QRCodeDownload
                      qrCode={qrCode}
                      fileName={`qr-${item.sku}`}
                      variant="default"
                      size="default"
                      showIcon
                      label="Download QR Code"
                      allowPrint
                      item={item}
                    />
                  </>
                )}
              </div>
            </Card>

            {item.status2 === 'ASSIGNED' && (
              <>
                <FinishingInstructions itemId={itemId} />
                <OrderInformation order={item.order} />
              </>
            )}
          </div>
          <div>
            <EventsTimeline itemId={itemId} />
          </div>
        </div>
      </div>

      <LogEventDialog
        itemId={itemId}
        open={logEventOpen}
        onOpenChange={setLogEventOpen}
      />

      <LogDefectDialog
        itemId={itemId}
        open={logDefectOpen}
        onOpenChange={setLogDefectOpen}
      />
    </div>
  )
}