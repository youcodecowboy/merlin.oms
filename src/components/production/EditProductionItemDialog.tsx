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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { updateMockProductionItem } from '@/lib/mock-api/production'
import type { ProductionRequest } from '@/lib/schema'

const formSchema = z.object({
  current_stage: z.enum(['CUTTING', 'SEWING', 'WASHING', 'FINISHING', 'QC', 'READY']),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface EditProductionItemDialogProps {
  item: ProductionRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditProductionItemDialog({ 
  item,
  open,
  onOpenChange,
  onSuccess 
}: EditProductionItemDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_stage: item?.current_stage || 'CUTTING',
      notes: item?.notes || ''
    }
  })

  const { execute: handleSubmit, loading } = useAsyncAction(async (values: FormValues) => {
    if (!item?.id) return
    await updateMockProductionItem(item.id, values)
    onOpenChange(false)
    form.reset()
    onSuccess?.()
  }, {
    successMessage: "Production item updated successfully"
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Production Item"
      triggerLabel="Edit Production Item"
      loading={loading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="current_stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stage</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CUTTING">Cutting</SelectItem>
                    <SelectItem value="SEWING">Sewing</SelectItem>
                    <SelectItem value="WASHING">Washing</SelectItem>
                    <SelectItem value="FINISHING">Finishing</SelectItem>
                    <SelectItem value="QC">QC</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
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