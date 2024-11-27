import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, ArrowRight, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { updateMockInventoryItem } from '@/lib/mock-api/inventory'
import { createMockInventoryEvent } from '@/lib/mock-api/events'
import type { InventoryItem } from '@/lib/schema'

interface ScanWorkflowProps {
  item: InventoryItem
  open: boolean
  onClose: () => void
  onComplete: (updatedItem: InventoryItem) => void
}

type ScanStep = 'VERIFY_ITEM' | 'SCAN_BIN' | 'COMPLETE'

export function ScanWorkflow({
  item,
  open,
  onClose,
  onComplete
}: ScanWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<ScanStep>('VERIFY_ITEM')
  const [scannedBin, setScannedBin] = useState<string>('')
  const [error, setError] = useState<string>('')
  const { toast } = useToast()

  const handleScan = async (qrData: string) => {
    try {
      setError('')

      if (currentStep === 'VERIFY_ITEM') {
        // Parse scanned item data
        const scannedItem = JSON.parse(qrData)
        
        // Verify exact match with our item
        if (scannedItem.id !== item.id) {
          setError('Incorrect item scanned. Please scan the QR code for ' + item.sku)
          toast({
            title: "Error",
            description: "Incorrect item scanned. Please scan the correct item.",
            variant: "destructive"
          })
          return
        }

        // Verify SKU match
        if (scannedItem.sku !== item.sku) {
          setError('SKU mismatch. Expected: ' + item.sku)
          toast({
            title: "Error",
            description: "SKU mismatch detected. Please verify the correct item.",
            variant: "destructive"
          })
          return
        }

        // Success - move to next step
        setCurrentStep('SCAN_BIN')
        toast({
          title: "Item Verified",
          description: "Now scan the destination bin"
        })
      } 
      else if (currentStep === 'SCAN_BIN') {
        // Validate bin format (TYPE-NUMBER-ZONE-RACK-SHELF)
        const binRegex = /^(BIN|RACK|WBIN|TBIN|FBIN)-\d+-[A-Z]\d+-\d+$/
        if (!binRegex.test(qrData)) {
          setError('Invalid bin format')
          toast({
            title: "Error",
            description: "Invalid bin format. Please scan a valid bin.",
            variant: "destructive"
          })
          return
        }

        // Update item location
        const updatedItem = await updateMockInventoryItem({
          ...item,
          location: qrData,
          updated_at: new Date().toISOString()
        })

        // Create move event
        await createMockInventoryEvent({
          inventory_item_id: item.id,
          event_name: 'MOVED',
          event_description: `Moved from ${item.location || 'unknown'} to ${qrData}`,
          status: 'COMPLETED',
          metadata: {
            from: item.location,
            to: qrData,
            method: 'scan',
            verified: true
          }
        })

        setScannedBin(qrData)
        setCurrentStep('COMPLETE')
        onComplete(updatedItem)
        
        toast({
          title: "Move Complete",
          description: `Item moved to ${qrData}`
        })
      }
    } catch (error) {
      setError('Invalid QR code data')
      toast({
        title: "Error",
        description: "Invalid QR code data",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {currentStep === 'VERIFY_ITEM' && (
            <div className="text-center space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Step 1: Verify Item</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Scan the QR code on {item.sku} to verify
                </p>
                {error && (
                  <div className="mt-2 text-sm text-destructive flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
              <Button 
                className="w-full"
                onClick={() => handleScan(JSON.stringify(item))} // Mock scan for demo
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan Item QR
              </Button>
            </div>
          )}

          {currentStep === 'SCAN_BIN' && (
            <div className="text-center space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Step 2: Scan New Location</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Scan the QR code of the bin where you're placing the item
                </p>
                {error && (
                  <div className="mt-2 text-sm text-destructive flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
              <Button 
                className="w-full"
                onClick={() => handleScan('BIN-1-Z1-1011')} // Mock scan for demo
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan Bin QR
              </Button>
            </div>
          )}

          {currentStep === 'COMPLETE' && (
            <div className="text-center space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium text-green-600">Move Complete!</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-sm">{item.location}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-sm font-medium">{scannedBin}</span>
                </div>
              </div>
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 