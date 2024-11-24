import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeDownload } from "@/components/QRCodeDownload"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { EventsLog } from "./EventsLog"
import { format } from 'date-fns'
import { X, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMockInventoryEvents } from "@/lib/mock-api"
import { useToast } from "@/components/ui/use-toast"
import type { InventoryItem, InventoryEvent } from "@/lib/schema"

interface InventoryDrawerProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
}

export function InventoryDrawer({ item, open, onClose }: InventoryDrawerProps) {
  const [events, setEvents] = useState<InventoryEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchEvents() {
      if (!item?.id) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await getMockInventoryEvents(item.id)
        setEvents(data)
      } catch (error) {
        console.error('Failed to fetch events:', error)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    if (open && item?.id) {
      fetchEvents()
    } else {
      setEvents([])
      setError(null)
    }
  }, [item?.id, open])

  const copyId = () => {
    if (item?.id) {
      navigator.clipboard.writeText(item.id)
      toast({
        title: "ID Copied",
        description: "Item ID copied to clipboard"
      })
    }
  }

  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Inventory Item Details</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono">{item.sku}</span>
              <Badge
                variant="outline"
                className="font-mono cursor-pointer hover:bg-muted"
                onClick={copyId}
              >
                ID: {item.id?.slice(0, 8)}...
                <Copy className="h-3 w-3 ml-1" />
              </Badge>
            </div>
            <SheetDescription>
              Created: {format(new Date(item.created_at), 'PPp')}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badges */}
          <div className="flex gap-2">
            <span className={cn(
              "inline-flex px-2 py-1 rounded-full text-xs font-medium",
              {
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': 
                  item.status1 === 'PRODUCTION',
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': 
                  item.status1 === 'STOCK'
              }
            )}>
              {item.status1}
            </span>
            <span className={cn(
              "inline-flex px-2 py-1 rounded-full text-xs font-medium",
              {
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': 
                  item.status2 === 'UNCOMMITTED',
                'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': 
                  item.status2 === 'COMMITTED'
              }
            )}>
              {item.status2}
            </span>
          </div>

          {/* QR Code */}
          {item.qr_code && (
            <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
              <QRCodeDownload
                qrCode={item.qr_code}
                fileName={`qr-${item.sku}`}
                variant="outline"
                item={item}
              />
            </div>
          )}

          {/* Events Log */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Events Log</h4>
            <EventsLog
              events={events}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}