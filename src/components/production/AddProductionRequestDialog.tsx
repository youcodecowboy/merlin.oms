import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Button } from "@/components/ui/button"
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { getMockProducts } from '@/lib/mock-api/products'
import { createMockPendingProduction } from '@/lib/mock-api/production'
import { priorityLevels } from '@/lib/schema'
import type { Product } from '@/lib/schema'

const formSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  priority: z.enum(priorityLevels),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface AddProductionRequestDialogProps {
  onSuccess?: () => void
}

export function AddProductionRequestDialog({ onSuccess }: AddProductionRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: '',
      quantity: 1,
      priority: 'MEDIUM',
      notes: ''
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

  const { execute: handleSubmit, loading: submitLoading } = useAsyncAction(async (values: FormValues) => {
    await createMockPendingProduction(values)
    setOpen(false)
    form.reset()
    onSuccess?.()
  }, {
    successMessage: "Production request created successfully"
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Create Production Request"
      triggerLabel="Create Request"
      loading={loading || submitLoading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SKU" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.sku}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <textarea 
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Add any additional notes..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={!form.formState.isValid || loading || submitLoading}
            >
              Create Request
            </Button>
          </div>
        </form>
      </Form>
    </FormDialog>
  )
}