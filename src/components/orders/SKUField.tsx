import { useCallback, useEffect, useState } from 'react'
import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseSKU, buildSKU } from "@/lib/core-functions"
import { getHemAdjustment } from "@/lib/core-functions"
import { hemOptions } from "@/lib/schema"
import { getMockProducts } from "@/lib/mock-api"
import type { Product } from "@/lib/schema"

interface SKUFieldProps {
  index: number
}

export function SKUField({ index }: SKUFieldProps) {
  const form = useFormContext()
  const [manualSKU, setManualSKU] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getMockProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    }
    loadProducts()
  }, [])

  const updateSKUFromComponents = useCallback(() => {
    try {
      const style = form.getValues(`items.${index}.style`)?.toUpperCase() || ""
      const waist = Number(form.getValues(`items.${index}.waist`)) || 28
      const shape = form.getValues(`items.${index}.shape`)?.toUpperCase() || ""
      const inseam = Number(form.getValues(`items.${index}.inseam`)) || 30
      const wash = form.getValues(`items.${index}.wash`)?.toUpperCase() || ""

      if (style && waist && shape && inseam && wash) {
        const components = { style, waist, shape, inseam, wash }
        const newSKU = buildSKU(components)
        setManualSKU(newSKU)
        form.setValue(`items.${index}.sku`, newSKU)
      }
    } catch (error) {
      console.error('Error updating SKU:', error)
    }
  }, [form, index])

  const handleSKUChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase()
    setManualSKU(upperValue)
    const parsed = parseSKU(upperValue)
    if (parsed) {
      form.setValue(`items.${index}.style`, parsed.style)
      form.setValue(`items.${index}.waist`, parsed.waist)
      form.setValue(`items.${index}.shape`, parsed.shape)
      form.setValue(`items.${index}.inseam`, parsed.inseam)
      form.setValue(`items.${index}.wash`, parsed.wash)
      form.setValue(`items.${index}.sku`, buildSKU(parsed))
    }
  }, [form, index])

  const handleProductSelect = useCallback((product: Product) => {
    const parsed = parseSKU(product.sku)
    if (parsed) {
      form.setValue(`items.${index}.style`, parsed.style)
      form.setValue(`items.${index}.waist`, parsed.waist)
      form.setValue(`items.${index}.shape`, parsed.shape)
      form.setValue(`items.${index}.inseam`, parsed.inseam)
      form.setValue(`items.${index}.wash`, parsed.wash)
      form.setValue(`items.${index}.sku`, product.sku)
      setManualSKU(product.sku)
    }
    setSearchOpen(false)
  }, [form, index])

  const handleHemChange = useCallback((hem: typeof hemOptions[number]) => {
    const currentInseam = form.getValues(`items.${index}.inseam`)
    const adjustment = getHemAdjustment(hem)
    const baseInseam = currentInseam - (getHemAdjustment(form.getValues(`items.${index}.hem`)) || 0)
    const newInseam = baseInseam + adjustment

    form.setValue(`items.${index}.hem`, hem)
    form.setValue(`items.${index}.inseam`, newInseam)
    
    const components = {
      style: form.getValues(`items.${index}.style`),
      waist: form.getValues(`items.${index}.waist`),
      shape: form.getValues(`items.${index}.shape`),
      inseam: newInseam,
      wash: form.getValues(`items.${index}.wash`),
    }
    
    const newSKU = buildSKU(components)
    setManualSKU(newSKU)
    form.setValue(`items.${index}.sku`, newSKU)
  }, [form, index])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith(`items.${index}.`) && !name.endsWith('.sku')) {
        updateSKUFromComponents()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, index, updateSKUFromComponents])

  const filteredProducts = products.filter(product => {
    const search = searchValue.toLowerCase()
    return (
      product.sku.toLowerCase().includes(search) ||
      product.name?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`items.${index}.sku`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  {...field}
                  value={manualSKU}
                  onChange={(e) => handleSKUChange(e.target.value)}
                  placeholder="ST-28-X-30-RAW"
                />
              </FormControl>
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
                    className="w-[120px] justify-between"
                  >
                    Search
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search products..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandEmpty>No products found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {filteredProducts.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.sku}
                          onSelect={() => handleProductSelect(product)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === product.sku ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-sm text-muted-foreground font-mono">
                              {product.sku}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-6 gap-4">
        <FormField
          control={form.control}
          name={`items.${index}.style`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="ST" 
                  maxLength={2}
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase())
                    updateSKUFromComponents()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.waist`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waist</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min={20} 
                  max={50}
                  onChange={e => {
                    field.onChange(parseInt(e.target.value))
                    updateSKUFromComponents()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.shape`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shape</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="X" 
                  maxLength={1}
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase())
                    updateSKUFromComponents()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.inseam`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inseam</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min={26} 
                  max={36}
                  onChange={e => {
                    field.onChange(parseInt(e.target.value))
                    updateSKUFromComponents()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.wash`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wash</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="RAW" 
                  maxLength={3}
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase())
                    updateSKUFromComponents()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.hem`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hem</FormLabel>
              <Select 
                onValueChange={handleHemChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hemOptions.map((hem) => (
                    <SelectItem key={hem} value={hem}>
                      {hem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`items.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}