import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { parseSKU } from '@/lib/sku'

interface SKUFilter {
  style?: string
  waist?: number
  shape?: string
  inseam?: number
  wash?: string
}

interface SKUSearchFilterProps {
  onFilter: (filter: SKUFilter) => void
}

export function SKUSearchFilter({ onFilter }: SKUSearchFilterProps) {
  const [skuInput, setSkuInput] = useState('')
  const [filter, setFilter] = useState<SKUFilter>({})

  const handleSKUParse = () => {
    const parsed = parseSKU(skuInput)
    if (parsed) {
      const newFilter = {
        style: parsed.style,
        waist: parsed.waist,
        shape: parsed.shape,
        inseam: parsed.inseam,
        wash: parsed.wash
      }
      setFilter(newFilter)
      onFilter(newFilter)
    }
  }

  const handleFilterChange = (key: keyof SKUFilter, value: string | number | undefined) => {
    const newFilter = { ...filter }
    if (value === undefined) {
      delete newFilter[key]
    } else {
      newFilter[key] = value
    }
    setFilter(newFilter)
    onFilter(newFilter)
  }

  const clearFilters = () => {
    setSkuInput('')
    setFilter({})
    onFilter({})
  }

  return (
    <div className="space-y-4">
      {/* SKU Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Enter SKU to parse (e.g., ST-32-S-32-RAW)"
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value.toUpperCase())}
            className="pl-8"
          />
        </div>
        <Button 
          variant="secondary" 
          onClick={handleSKUParse}
          disabled={!skuInput}
        >
          Parse SKU
        </Button>
      </div>

      {/* Individual Filters */}
      <div className="grid grid-cols-5 gap-2">
        <Select
          value={filter.style?.toString() || undefined}
          onValueChange={(value) => handleFilterChange('style', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ST">ST (Standard)</SelectItem>
            <SelectItem value="SL">SL (Slim)</SelectItem>
            <SelectItem value="RL">RL (Relaxed)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.waist?.toString() || undefined}
          onValueChange={(value) => handleFilterChange('waist', value ? parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Waist" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 31 }, (_, i) => i + 20).map(size => (
              <SelectItem key={size} value={size.toString()}>{size}"</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.shape?.toString() || undefined}
          onValueChange={(value) => handleFilterChange('shape', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Shape" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="S">S (Slim)</SelectItem>
            <SelectItem value="R">R (Regular)</SelectItem>
            <SelectItem value="X">X (Relaxed)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.inseam?.toString() || undefined}
          onValueChange={(value) => handleFilterChange('inseam', value ? parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Inseam" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 11 }, (_, i) => i + 26).map(size => (
              <SelectItem key={size} value={size.toString()}>{size}"</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.wash?.toString() || undefined}
          onValueChange={(value) => handleFilterChange('wash', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wash" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RAW">RAW</SelectItem>
            <SelectItem value="STA">STA</SelectItem>
            <SelectItem value="IND">IND</SelectItem>
            <SelectItem value="BLK">BLK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {Object.keys(filter).length > 0 && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}