import { useState, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductSearchProps {
  label?: string
  value: string
  onSelect: (sku: string) => void
}

// Using the correct SKU format: ST-XX-Y-II-WWW
const SAMPLE_PRODUCTS = [
  'ST-32-X-30-IND',
  'ST-24-X-30-STA',
  'ST-36-Y-32-ONX',
  'ST-28-X-28-JAG',
  'ST-30-Y-34-RAW',
  'ST-34-X-36-BRW',
  'ST-38-Y-30-IND',
  'ST-40-X-32-STA',
  'ST-42-Y-34-ONX',
  'ST-44-X-30-RAW'
]

export const ProductSearch = ({ label = 'Product', value, onSelect }: ProductSearchProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || `Search ${label} SKU...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${label} SKU...`} />
          <CommandEmpty>No SKU found.</CommandEmpty>
          <CommandGroup>
            {SAMPLE_PRODUCTS.map((sku) => (
              <CommandItem
                key={sku}
                value={sku}
                onSelect={(currentValue) => {
                  onSelect(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === sku ? "opacity-100" : "opacity-0"
                  )}
                />
                {sku}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 