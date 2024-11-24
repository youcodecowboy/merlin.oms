import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Request } from "@/lib/schema"

const formSchema = z.object({
  fabricCode: z.string().length(3, "Fabric code must be exactly 3 characters"),
  layers: z.number().min(1, "Must have at least 1 layer"),
  notes: z.string().optional(),
})

interface CreateCuttingBatchDialogProps {
  open: boolean
  onClose: () => void
  selectedPatterns: Request[]
  onCreateBatch: (data: z.infer<typeof formSchema>) => void
}

export function CreateCuttingBatchDialog({
  open,
  onClose,
  selectedPatterns,
  onCreateBatch,
}: CreateCuttingBatchDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fabricCode: '',
      layers: selectedPatterns.reduce((total, pattern) => 
        total + (pattern.pattern_details?.quantity || 1), 0
      ),
      notes: '',
    },
  })

  const totalQuantity = selectedPatterns.reduce((total, pattern) => 
    total + (pattern.pattern_details?.quantity || 1), 0
  )

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onCreateBatch(data)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Cutting Batch</DialogTitle>
          <DialogDescription>
            Create a new cutting batch with {selectedPatterns.length} pattern{selectedPatterns.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fabricCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabric Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter 3-digit code" maxLength={3} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="layers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Layers</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
                    <Textarea {...field} placeholder="Add any cutting instructions or notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Patterns in this batch:</h4>
              <div className="space-y-2">
                {selectedPatterns.map((pattern) => (
                  <div 
                    key={pattern.id} 
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-mono">{pattern.inventory_item_id}</span>
                    <span>Quantity: {pattern.pattern_details?.quantity || 1}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total Quantity:</span>
                  <span>{totalQuantity}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Batch</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 