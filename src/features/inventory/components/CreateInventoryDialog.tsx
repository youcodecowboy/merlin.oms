import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductSelect } from '@/components/inventory/ProductSelect'
import type { InventoryItem, Product } from '@/lib/schema'
import type { CreateInventoryDialogProps } from '../types'

export function CreateInventoryDialog({ 
  open, 
  onOpenChange 
}: CreateInventoryDialogProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    id: crypto.randomUUID(),
    status1: 'STOCK',
    status2: 'UNCOMMITTED',
    batch_id: 'manual inventory',
    created_at: new Date().toISOString()
  })

  const [selectedSku, setSelectedSku] = useState<string>('')
  const [qty, setQty] = useState(1)

  const handleProductSelect = (product: Product) => {
    if (!product.sku) {
      alert('Invalid product selection')
      return
    }

    setSelectedSku(product.sku)
    setFormData(prev => ({
      ...prev,
      sku: product.sku
    }))
  }

  const handleSubmit = () => {
    if (!formData.sku) {
      alert('Please select a product')
      return
    }
    
    const finalData = {
      ...formData,
      quantity: qty,
      created_at: new Date().toISOString()
    } as InventoryItem

    // TODO: Handle submit
    onOpenChange(false)
  }

  const handleStatusChange = (value: 'STOCK' | 'PRODUCTION') => {
    setFormData(prev => ({ ...prev, status1: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Manual Inventory</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Selected SKU: {selectedSku}</Label>
            <ProductSelect onSelect={handleProductSelect} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue="STOCK"
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK">Stock</SelectItem>
                <SelectItem value="PRODUCTION">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedSku}>Add to Inventory</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 