import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { PendingProduction } from "@/lib/schema"
import { acceptMockProductionRequest } from '@/lib/mock-api/production'

interface AcceptProductionDialogProps {
  request: PendingProduction
  open: boolean
  onClose: () => void
  onAccept: (batchId: string) => void
}

export function AcceptProductionDialog({
  request,
  open,
  onClose,
  onAccept,
}: AcceptProductionDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAccept = async () => {
    try {
      setLoading(true)
      console.log('Starting acceptance of production request:', request)

      const result = await acceptMockProductionRequest(request.id)
      console.log('Production request acceptance result:', result)

      if (result.success) {
        console.log('Production batch created:', result.batchId)
        console.log('Pattern request created:', result.patternRequestId)

        toast({
          title: "Production Request Accepted",
          description: `Created batch ${result.batchId} and pattern request ${result.patternRequestId}`,
        })

        onAccept(result.batchId!)
      }
    } catch (error) {
      console.error('Failed to accept production request:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept production request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Production Request</DialogTitle>
          <DialogDescription>
            Create a new production batch for {request.quantity}x {request.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SKU</Label>
              <div className="font-mono mt-1">{request.sku}</div>
            </div>
            <div>
              <Label>Quantity</Label>
              <div className="font-medium mt-1">{request.quantity}</div>
            </div>
          </div>

          {request.notes && (
            <div>
              <Label>Notes</Label>
              <div className="text-sm mt-1">{request.notes}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accept Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 