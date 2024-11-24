import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getMockProducts } from '@/lib/mock-api/products'
import type { OrderItem } from '@/lib/schema'

interface ProductSelectProps {
  onSelect: (item: OrderItem) => void
  onBack: () => void
}

const HEM_OPTIONS = [
  { value: 'SND', label: 'Standard (+0")', adjustment: 0 },
  { value: 'RAW', label: 'Raw (+0")', adjustment: 0 },
  { value: 'ORL', label: 'Original (+2")', adjustment: 2 },
  { value: 'HRL', label: 'Heavy Raw (+4")', adjustment: 4 }
] as const

export function ProductSelect({ onSelect, onBack }: ProductSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedHem, setSelectedHem] = useState<typeof HEM_OPTIONS[number]['value']>('SND')

  const handleSearch = async () => {
    try {
      setLoading(true)
      const results = await getMockProducts(searchQuery)
      setProducts(results)
    } catch (error) {
      console.error('Failed to search products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!selectedProduct) return

    // Find the hem adjustment
    const hemOption = HEM_OPTIONS.find(option => option.value === selectedHem)
    if (!hemOption) return

    // Parse the SKU components
    const [style, waist, shape, inseam, wash] = selectedProduct.sku.split('-')
    const baseInseam = parseInt(inseam)
    const adjustedInseam = baseInseam + hemOption.adjustment

    // Create the order item with adjusted inseam and updated SKU
    const orderItem: OrderItem = {
      sku: `${style}-${waist}-${shape}-${adjustedInseam}-${wash}`, // Updated SKU with adjusted inseam
      style,
      waist: parseInt(waist),
      shape,
      inseam: adjustedInseam, // Use adjusted inseam
      wash,
      hem: selectedHem,
      quantity,
      baseInseam // Store original inseam
    }

    onSelect(orderItem)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h3 className="text-lg font-medium">Add Product</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Search Product</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or style"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Searching...
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="font-mono">{product.sku}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.name}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery
                  ? 'No products found'
                  : 'Search for a product to begin'}
              </div>
            )}
          </div>
        </ScrollArea>

        {selectedProduct && (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hem Style</Label>
                <Select
                  value={selectedHem}
                  onValueChange={(value) => setSelectedHem(value as typeof selectedHem)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEM_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full" onClick={handleSubmit}>
              Add to Order
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 