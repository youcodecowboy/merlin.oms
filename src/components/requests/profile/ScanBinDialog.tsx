import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { Scan } from "lucide-react"

interface ScanBinDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ScanBinDialog({
  requestId,
  open,
  onOpenChange,
  onSuccess
}: ScanBinDialogProps) {
  const [binCode, setBinCode] = useState('')

  const { execute: handleSubmit, loading } = useAsyncAction(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Scanning bin:', { requestId, binCode })
    onOpenChange(false)
    setBinCode('')
    onSuccess?.()
  }, {
    successMessage: "Bin scanned successfully"
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Bin</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bin Code</label>
            <div className="flex gap-2">
              <Input
                value={binCode}
                onChange={(e) => setBinCode(e.target.value)}
                placeholder="Enter or scan bin code"
              />
              <Button variant="outline" size="icon">
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSubmit()}
              disabled={!binCode || loading}
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}