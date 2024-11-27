import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Loader2, QrCode, ArrowRight, Check, Search, Package, Scan } from "lucide-react"
import { assignItemToBin } from "@/lib/mock-db/store"
import { mockDB } from "@/lib/mock-db/store"
import type { Bin } from "@/lib/schema/bins"
import type { DBInventoryItem } from "@/lib/schema/database"

interface AddItemToBinDialogProps {
  bin: Bin
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Step = 'scan' | 'search' | 'review' | 'confirm'

export function AddItemToBinDialog({ 
  bin, 
  open, 
  onOpenChange,
  onSuccess 
}: AddItemToBinDialogProps) {
  const [step, setStep] = useState<Step>('scan')
  const [scannedId, setScannedId] = useState('')
  const [item, setItem] = useState<DBInventoryItem | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Get available items (not in any bin)
  const availableItems = mockDB.inventory_items.filter(
    item => !item.location?.startsWith('BIN-')
  )

  const handleScan = () => {
    if (!scannedId.trim()) return
    
    const foundItem = mockDB.inventory_items.find(i => i.id === scannedId)
    if (!foundItem) {
      setError('Item not found')
      return
    }
    
    if (foundItem.location?.startsWith('BIN-')) {
      setError('Item is already in a bin')
      return
    }

    setItem(foundItem)
    setError('')
    setStep('review')
  }

  const handleItemSelect = (selectedItem: DBInventoryItem) => {
    setItem(selectedItem)
    setStep('review')
  }

  const handleConfirm = async () => {
    if (!item || !bin) return

    setIsLoading(true)
    setError('')

    try {
      const result = assignItemToBin(item, bin.id)
      
      if (result.success) {
        setStep('confirm')
        setTimeout(() => {
          onSuccess?.()
          onOpenChange(false)
          // Reset state
          setStep('scan')
          setScannedId('')
          setItem(null)
          setError('')
        }, 1500)
      } else {
        setError(result.error || 'Failed to assign item to bin')
      }
    } catch (err) {
      setError('Failed to assign item to bin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('scan')
    setScannedId('')
    setItem(null)
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Item to Bin {bin.id}</DialogTitle>
        </DialogHeader>

        {step === 'scan' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Scan or enter item ID"
                value={scannedId}
                onChange={(e) => setScannedId(e.target.value)}
              />
              <Button onClick={handleScan}>
                <Scan className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or search inventory
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setStep('search')}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Available Items
            </Button>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}

        {step === 'search' && (
          <div className="space-y-4">
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Search items..." />
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup heading="Available Items">
                {availableItems.map((availableItem) => (
                  <CommandItem
                    key={availableItem.id}
                    onSelect={() => handleItemSelect(availableItem)}
                    className="cursor-pointer"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{availableItem.id}</span>
                        <Badge variant="outline">
                          {availableItem.current_sku}
                        </Badge>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setStep('scan')}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Back to Scan
            </Button>
          </div>
        )}

        {step === 'review' && item && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Item ID:</span>
                  <span className="font-mono">{item.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">SKU:</span>
                  <span>{item.current_sku}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current Location:</span>
                  <Badge variant="outline">{item.location || 'Not set'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">New Location:</span>
                  <Badge>BIN-{bin.id}</Badge>
                </div>
              </div>
            </Card>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(scannedId ? 'scan' : 'search')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={isLoading || !item}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Confirm Move
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
            </div>
            <p className="text-lg font-medium">Item Added Successfully</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 