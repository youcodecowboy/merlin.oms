import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductSearch } from '@/components/products/ProductSearch'
import { generateInventoryItems } from '@/lib/production'
import { nanoid } from 'nanoid'

interface AddInventoryDialogProps {
  open: boolean
  onClose: () => void
  onInventoryAdded: () => void
}

export const AddInventoryDialog = ({ open, onClose, onInventoryAdded }: AddInventoryDialogProps) => {
  const [selectedSku, setSelectedSku] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedSku) return
    
    setIsSubmitting(true)
    try {
      // Create a temporary batch ID for these manual items
      const manualBatchId = `manual_${nanoid()}`
      
      // Generate and save the inventory items
      await generateInventoryItems({
        batchId: manualBatchId,
        sku: selectedSku,
        quantity
      })

      // Reset form
      setSelectedSku('')
      setQuantity(1)
      
      // Notify parent to refresh
      onInventoryAdded()
      onClose()
    } catch (error) {
      console.error('Failed to add inventory:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Manual Inventory</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ProductSearch
            label="Select Product"
            onSelect={(sku: string) => setSelectedSku(sku)}
            value={selectedSku}
          />
          
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            placeholder="Quantity"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedSku || isSubmitting}
          >
            Add Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}