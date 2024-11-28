import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, BoxSelect, Archive, QrCode, Printer, ArrowLeft, Check } from "lucide-react"
import { generateUniqueBinId } from "@/lib/utils/id-generator"
import { mockDB } from "@/lib/mock-db/store"
import { QRCodeSVG } from 'qrcode.react'
import type { Bin, BinZone } from "@/lib/schema/bins"

interface CreateBinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface BinSize {
  capacity: number
  icon: React.ReactNode
  label: string
  description: string
}

interface BinLocation {
  rack: string
  shelf: string
}

const BIN_SIZES: BinSize[] = [
  {
    capacity: 10,
    icon: <Package className="h-8 w-8" />,
    label: "Small Bin",
    description: "Capacity: 10 items"
  },
  {
    capacity: 25,
    icon: <BoxSelect className="h-8 w-8" />,
    label: "Medium Bin",
    description: "Capacity: 25 items"
  },
  {
    capacity: 100,
    icon: <Archive className="h-8 w-8" />,
    label: "Large Bin",
    description: "Capacity: 100 items"
  }
]

const ZONES = ['1', '2', '3', '4', '5']

type Step = 'selection' | 'summary'

export function CreateBinDialog({ open, onOpenChange, onSuccess }: CreateBinDialogProps) {
  const [step, setStep] = useState<Step>('selection')
  const [selectedCapacity, setSelectedCapacity] = useState<number | null>(null)
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [previewBin, setPreviewBin] = useState<any>(null)

  const handleNext = () => {
    if (!selectedCapacity || !selectedZone) return

    // Find next available rack and shelf
    const existingBins = mockDB.bins || []
    const zonesRacks = existingBins
      .filter((b: Bin) => b.zone === selectedZone)
      .map((b: Bin) => ({ rack: b.rack, shelf: b.shelf }))

    let nextRack = 'A'
    let nextShelf = '1'

    while (zonesRacks.some((zr: BinLocation) => zr.rack === nextRack && zr.shelf === nextShelf)) {
      if (nextShelf === '4') {
        nextShelf = '1'
        nextRack = String.fromCharCode(nextRack.charCodeAt(0) + 1)
      } else {
        nextShelf = String(parseInt(nextShelf) + 1)
      }
    }

    const binId = generateUniqueBinId(
      selectedCapacity,
      selectedZone,
      nextShelf,
      nextRack
    )

    setPreviewBin({
      id: binId,
      zone: selectedZone,
      rack: nextRack,
      shelf: nextShelf,
      capacity: selectedCapacity
    })

    setStep('summary')
  }

  const handleBack = () => {
    setStep('selection')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrCode = document.getElementById('bin-qr-code')?.innerHTML
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bin QR Code - ${previewBin.id}</title>
          <style>
            body { font-family: system-ui; padding: 20px; }
            .container { text-align: center; }
            .details { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Bin ${previewBin.id}</h2>
            ${qrCode}
            <div class="details">
              <p>Zone: ${previewBin.zone}</p>
              <p>Rack: ${previewBin.rack}</p>
              <p>Shelf: ${previewBin.shelf}</p>
              <p>Capacity: ${previewBin.capacity} items</p>
            </div>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  const handleCreate = () => {
    if (!previewBin) return

    const newBin = {
      ...previewBin,
      current_items: 0,
      items: []
    }

    if (!mockDB.bins) mockDB.bins = []
    mockDB.bins.push(newBin)

    // Reset state
    setSelectedCapacity(null)
    setSelectedZone('')
    setPreviewBin(null)
    setStep('selection')
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Bin</DialogTitle>
        </DialogHeader>

        {step === 'selection' ? (
          <div className="space-y-6 py-4">
            {/* Bin Size Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Bin Size</label>
              <div className="grid grid-cols-3 gap-4">
                {BIN_SIZES.map((size) => (
                  <Card
                    key={size.capacity}
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      selectedCapacity === size.capacity ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedCapacity(size.capacity)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      {size.icon}
                      <h3 className="font-medium">{size.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {size.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Zone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Zone</label>
              <Select
                value={selectedZone}
                onValueChange={(value: string) => setSelectedZone(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      Zone {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {selectedCapacity && selectedZone && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="text-sm space-y-1">
                  <div>Capacity: {selectedCapacity} items</div>
                  <div>Zone: {selectedZone}</div>
                  <div>Location: Will be automatically assigned</div>
                </div>
              </div>
            )}

            {/* Create Button */}
            <Button
              className="w-full"
              disabled={!selectedCapacity || !selectedZone}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-center" id="bin-qr-code">
              <QRCodeSVG 
                value={`${window.location.origin}/bins/${previewBin.id}`}
                size={200}
                includeMargin
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Bin Details</h3>
                <div>ID: {previewBin.id}</div>
                <div>Zone: {previewBin.zone}</div>
                <div>Location: Rack {previewBin.rack}, Shelf {previewBin.shelf}</div>
                <div>Capacity: {previewBin.capacity} items</div>
              </div>
              
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Actions</h3>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print QR Code
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleCreate}>
                <Check className="h-4 w-4 mr-2" />
                Create Bin
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 