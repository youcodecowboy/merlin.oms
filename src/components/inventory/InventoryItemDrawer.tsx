import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeDownload } from "@/components/QRCodeDownload"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryItemDrawerProps {
  item: any // Replace with proper type
  open: boolean
  onClose: () => void
}

export function InventoryItemDrawer({
  item,
  open,
  onClose
}: InventoryItemDrawerProps) {
  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <div className="flex flex-col h-full">
          <SheetHeader className="space-y-4 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle className="text-xl font-mono">
                  {item.sku}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Location: Bin A-123
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "h-6 px-2 text-xs",
                    item.status === 'READY' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  )}
                >
                  {item.status}
                </Badge>
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

          <div className="flex-1 overflow-auto py-4">
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-muted/50 rounded-lg mb-6">
              <QRCodeDownload
                qrCode="data:image/png;base64,..."
                fileName={`qr-${item.sku}`}
                variant="outline"
              />
            </div>

            {/* Item Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Production Status</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Stage</span>
                      <span className="font-medium">Cutting</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Started</span>
                      <span className="font-medium">Jan 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ETA</span>
                      <span className="font-medium">Jan 25, 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Linked Order</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Order Number</span>
                      <span className="font-medium">#1001</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer</span>
                      <span className="font-medium">John Doe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}