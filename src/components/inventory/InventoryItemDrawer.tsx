import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { InventoryItemDetails } from "./InventoryItemDetails"
import { ItemEventHistory } from "./ItemEventHistory"
import { useInventoryData } from "@/lib/hooks/useInventoryData"
import { Loader2 } from "lucide-react"
import type { InventoryItem } from "@/lib/schema"

interface InventoryItemDrawerProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
}

export function InventoryItemDrawer({ item, open, onClose }: InventoryItemDrawerProps) {
  const {
    item: itemData,
    activeRequest,
    events,
    loading,
    error
  } = useInventoryData(item?.id)

  if (!item) return null

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent>
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (error) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-destructive">{error}</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[540px] overflow-y-auto">
        <div className="space-y-6 pt-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Item Details</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono">{item.sku}</span>
              <Badge>{item.status1}</Badge>
              <Badge variant="outline">{item.status2}</Badge>
            </div>
            <InventoryItemDetails item={item} />
          </div>

          <Separator />

          {/* Active Request */}
          {activeRequest && (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-4">Active Request</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Request Type</span>
                    <Badge>{activeRequest.request_type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline">{activeRequest.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(activeRequest.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Production Info */}
          {item.production_batch && (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-4">Production Info</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Batch ID</span>
                    <span className="font-mono">{item.production_batch}</span>
                  </div>
                  {item.production_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Production Date</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.production_date).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Event History */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Event History</h2>
            <ItemEventHistory itemId={item.id} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}