import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { useAsyncAction } from "@/hooks/useAsyncAction"

const formSchema = z.object({
  defectType: z.enum(['FABRIC', 'STITCHING', 'HARDWARE', 'FINISHING', 'OTHER']),
  description: z.string().min(1, "Description is required"),
  action: z.enum(['QUARANTINE', 'REPAIR', 'REVIEW']),
  notes: z.string().optional()
})

interface LogDefectDialogProps {
  itemId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LogDefectDialog({
  itemId,
  open,
  onOpenChange,
  onSuccess
}: LogDefectDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defectType: 'FABRIC',
      description: '',
      action: 'REVIEW',
      notes: ''
    }
  })

  const { execute: handleSubmit, loading } = useAsyncAction(async (values: z.infer<typeof formSchema>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Logged defect:', { itemId, ...values })
    onOpenChange(false)
    form.reset()
    onSuccess?.()
  }, {
    successMessage: "Defect logged successfully"
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Defect</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Defect Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select defect type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FABRIC">Fabric</SelectItem>
                      <SelectItem value="STITCHING">Stitching</SelectItem>
                      <SelectItem value="HARDWARE">Hardware</SelectItem>
                      <SelectItem value="FINISHING">Finishing</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe the defect..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select required action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="QUARANTINE">Quarantine</SelectItem>
                      <SelectItem value="REPAIR">Requires Repair</SelectItem>
                      <SelectItem value="REVIEW">Needs Review</SelectItem>
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
                  <FormLabel>Additional Notes</FormLabel>
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
              <Button type="submit" variant="destructive" disabled={loading}>
                Log Defect
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}