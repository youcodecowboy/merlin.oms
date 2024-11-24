import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormDialog } from '@/components/forms/FormDialog'
import { Form } from '@/components/ui/form'
import { FormField } from '@/components/forms/FormField'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { createPendingProduction } from '@/lib/api'
import { pendingProductionSchema, priorityLevels } from '@/lib/schema'

const formSchema = pendingProductionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

type FormValues = z.infer<typeof formSchema>

interface CreatePendingProductionDialogProps {
  onSuccess?: () => void
}

export function CreatePendingProductionDialog({ 
  onSuccess 
}: CreatePendingProductionDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      orders_affected: 0,
      priority: 'MEDIUM',
      notes: ''
    }
  })

  const { execute: handleSubmit, loading } = useAsyncAction(async (values: FormValues) => {
    await createPendingProduction(values)
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
      loading={loading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            form={form}
            name="sku"
            label="SKU"
            placeholder="Enter SKU"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              form={form}
              name="quantity"
              label="Quantity"
              type="number"
            />

            <FormField
              form={form}
              name="orders_affected"
              label="Orders Affected"
              type="number"
            />
          </div>

          <FormField
            form={form}
            name="priority"
            label="Priority"
            control={
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {priorityLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            }
          />

          <FormField
            form={form}
            name="notes"
            label="Notes"
            control={
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            }
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              disabled={loading}
            >
              Create Request
            </button>
          </div>
        </form>
      </Form>
    </FormDialog>
  )
}