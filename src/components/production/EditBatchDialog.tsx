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
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { updateMockBatch } from '@/lib/mock-api/batches'
import type { Batch } from '@/lib/schema'

const formSchema = z.object({
  total_quantity: z.number().min(1, "Quantity must be at least 1"),
  status: z.enum(['CREATED', 'IN_PROGRESS', 'COMPLETED']),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface EditBatchDialogProps {
  item: Batch | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditBatchDialog({ 
  item,
  open,
  onOpenChange,
  onSuccess 
}: EditBatchDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      total_quantity: item?.total_quantity || 1,
      status: item?.status || 'CREATED',
      notes: item?.notes || ''
    }
  })

  const { execute: handleSubmit, loading } = useAsyncAction(async (values: FormValues) => {
    if (!item?.id) return
    await updateMockBatch(item.id, values)
    onOpenChange(false)
    form.reset()
    onSuccess?.()
  }, {
    successMessage: "Batch updated successfully"
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Batch"
      triggerLabel="Edit Batch"
      loading={loading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="total_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min={1}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
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
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
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
                    placeholder="Add any notes..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormDialog>
  )
}