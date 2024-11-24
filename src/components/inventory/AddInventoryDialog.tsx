import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormDialog } from '@/components/forms/FormDialog'
import {
  Form,
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
import { getMockProducts } from '@/lib/mock-api'
import type { Product } from "@/lib/schema"

const formSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  status1: z.enum(["STOCK", "PRODUCTION"]),
  status2: z.enum(["COMMITTED", "UNCOMMITTED"])
})

interface AddInventoryDialogProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onSuccess?: () => void
}

export function AddInventoryDialog({ 
  onSubmit,
  onSuccess 
}: AddInventoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      quantity: 1,
      status1: "STOCK",
      status2: "UNCOMMITTED"
    }
  })

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

  const handleProductSelect = (product: Product) => {
    form.setValue('sku', product.sku, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    })
    setSearchOpen(false)
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      await onSubmit({
        ...values,
        quantity: Number(values.quantity)
      })
      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add inventory:', error)
      throw error // Let the parent handle the error toast
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const search = searchValue.toLowerCase()
    return (
      product.sku.toLowerCase().includes(search) ||
      product.name.toLowerCase().includes(search)
    )
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Add Inventory Items"
      triggerLabel="Add Inventory"
      loading={loading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="ST-28-X-30-RAW" />
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

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                    value={field.value || 1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status 1</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STOCK">Stock</SelectItem>
                      <SelectItem value="PRODUCTION">Production</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status 2</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COMMITTED">Committed</SelectItem>
                      <SelectItem value="UNCOMMITTED">Uncommitted</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={!form.formState.isValid || loading}
            >
              Add Items
            </Button>
          </div>
        </form>
      </Form>
    </FormDialog>
  )
}