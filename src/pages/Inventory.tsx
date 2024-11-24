import { useState } from 'react'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { QRCodeScanner } from '@/components/QRCodeScanner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Scan } from 'lucide-react'

export function Inventory() {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const handleScanSuccess = (itemId: string) => {
    setScannerOpen(false)
    setSelectedItemId(itemId)
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={() => setScannerOpen(true)}>
          <Scan className="mr-2 h-4 w-4" />
          Scan QR Code
        </Button>
      </div>

      <InventoryTable 
        selectedItemId={selectedItemId}
        onItemSelect={setSelectedItemId}
      />

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}