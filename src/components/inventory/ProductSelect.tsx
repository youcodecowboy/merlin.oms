import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockProducts } from '@/lib/mock-api/products'
import type { Product } from '@/lib/schema'

interface ProductSelectProps {
  onSelect: (product: Product) => void
}

export function ProductSelect({ onSelect }: ProductSelectProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Product[]>([])

  const handleSearch = (term: string) => {
    setSearch(term)
    if (!term) {
      setResults([])
      return
    }

    const filtered = mockProducts.filter((product: Product) => 
      product.sku?.toLowerCase().includes(term.toLowerCase())
    )
    setResults(filtered)
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by SKU..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <ScrollArea className="h-[200px] rounded-md border">
        <div className="p-4">
          {results.map((product) => (
            <Button
              key={product.sku}
              variant="ghost"
              className="w-full justify-start text-left font-normal"
              onClick={() => onSelect(product)}
            >
              {product.sku}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 