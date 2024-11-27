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
import { nanoid } from 'nanoid'
import type { PendingProduction } from '@/lib/schema'

interface Props {
  request: PendingProduction | null
  open: boolean
  onClose: () => void
  onAccept: (batchId: string) => Promise<void>
}

export function AcceptProductionDialog({ request, open, onClose, onAccept }: Props) {
  const [batchId, setBatchId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!request) return

    try {
      // Generate a batch ID if one wasn't provided
      const finalBatchId = batchId || `BATCH-${nanoid(6)}`
      await onAccept(finalBatchId)
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Production Request</DialogTitle>
          <DialogDescription>
            Create a new production batch for this request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Request Details</Label>
              <div className="text-sm">
                <p>SKU: {request?.sku}</p>
                <p>Quantity: {request?.quantity}</p>
                <p>Priority: {request?.priority}</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="batchId">Batch ID (optional)</Label>
              <Input
                id="batchId"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Leave empty to auto-generate"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 