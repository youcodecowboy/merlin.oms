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
import { updateMockPendingProduction } from '@/lib/mock-api/production'
import { priorityLevels } from '@/lib/schema'
import type { PendingProduction } from '@/lib/schema'

const formSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  priority: z.enum(priorityLevels),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface EditPendingProductionDialogProps {
  item: PendingProduction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditPendingProductionDialog({ 
  item,
  open,
  onOpenChange,
  onSuccess 
}: EditPendingProductionDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: item?.quantity || 1,
      priority: item?.priority || 'MEDIUM',
      notes: item?.notes || ''
    }
  })

  const { execute: handleSubmit, loading } = useAsyncAction(async (values: FormValues) => {
    if (!item?.id) return
    await updateMockPendingProduction(item.id, values)
    onOpenChange(false)
    form.reset()
    onSuccess?.()
  }, {
    successMessage: "Production request updated successfully"
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Production Request"
      triggerLabel="Edit Production Request"
      loading={loading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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