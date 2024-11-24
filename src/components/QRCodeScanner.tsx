import { useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { handleInventoryQRScan } from '@/lib/mock-api'

interface QRCodeScannerProps {
  onScanSuccess?: (itemId: string) => void
  onClose?: () => void
}

export function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      )

      scanner.render(async (decodedText) => {
        // Stop scanner after successful scan
        scanner.clear()
        setScanning(false)

        try {
          // Process the scanned QR code
          const result = await handleInventoryQRScan(decodedText)
          
          if (result.success && result.item) {
            toast({
              title: "Item Found",
              description: `Found inventory item: ${result.item.id}`,
            })
            // Trigger the callback with the item ID
            onScanSuccess?.(result.item.id)
          } else {
            toast({
              title: "Scan Error",
              description: result.message,
              variant: "destructive"
            })
          }
        } catch (error) {
          toast({
            title: "Scan Error",
            description: "Failed to process QR code",
            variant: "destructive"
          })
        }
      }, (error) => {
        console.error("QR Scan error:", error)
      })

      return () => {
        scanner.clear()
      }
    }
  }, [scanning, onScanSuccess, toast])

  return (
    <div className="space-y-4">
      {!scanning ? (
        <Button onClick={() => setScanning(true)}>
          Start Scanning
        </Button>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="w-full max-w-sm mx-auto" />
          <Button variant="outline" onClick={() => {
            setScanning(false)
            onClose?.()
          }}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
} 