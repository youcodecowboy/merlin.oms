import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { updateMockInventoryItem } from '@/lib/mock-api/inventory'
import { createMockInventoryEvent } from '@/lib/mock-api/events'
import type { InventoryItem } from '@/lib/schema'
import { QrCode } from 'lucide-react'

interface MoveItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
}

export function MoveItemDialog({
  open,
  onOpenChange,
  item
}: MoveItemDialogProps) {
  const [newLocation, setNewLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMove = async () => {
    if (!newLocation) {
      toast({
        title: "Error",
        description: "Please enter a new location",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Create move event
      const event = await createMockInventoryEvent({
        inventory_item_id: item.id,
        event_name: 'ITEM_MOVED',
        event_description: `Item moved from ${item.location || 'unknown'} to ${newLocation}`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        metadata: {
          previous_location: item.location,
          new_location: newLocation
        }
      })

      // Update item location
      await updateMockInventoryItem({
        ...item,
        location: newLocation,
        events: [...(item.events || []), event],
        updated_at: new Date().toISOString()
      })

      toast({
        title: "Item Moved",
        description: `Successfully moved item to ${newLocation}`
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to move item:', error)
      toast({
        title: "Error",
        description: "Failed to move item",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
          <DialogDescription>
            Enter the new location for item {item.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-location">Current Location</Label>
            <Input
              id="current-location"
              value={item.location || 'Not specified'}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-location">New Location</Label>
            <div className="flex gap-2">
              <Input
                id="new-location"
                placeholder="Enter new location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={loading || !newLocation}
          >
            Move Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 