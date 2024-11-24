import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
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
import { getNextOrderNumber } from "@/lib/core-functions"

interface OrderDetailsStageProps {
  form: UseFormReturn<any>
  onNext: () => void
  onBack: () => void
}

export function OrderDetailsStage({ 
  form, 
  onNext, 
  onBack 
}: OrderDetailsStageProps) {
  useEffect(() => {
    async function initializeOrderNumber() {
      try {
        const nextNumber = await getNextOrderNumber()
        const orderNumber = nextNumber && nextNumber >= 1000 ? nextNumber : 1000
        form.setValue('number', orderNumber, { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true 
        })
      } catch (error) {
        console.error('Failed to get next order number:', error)
        form.setValue('number', 1000, { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true 
        })
      }
    }
    initializeOrderNumber()
  }, [form])

  return (
    <Form {...form}>
      <form 
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          const isValid = form.trigger('number')
          if (isValid) {
            onNext()
          }
        }}
      >
        <FormField
          control={form.control}
          name="number"
          rules={{
            required: "Order number is required",
            min: {
              value: 1000,
              message: "Order number must be at least 1000"
            },
            max: {
              value: 9999,
              message: "Order number must be at most 9999"
            },
            validate: (value) => {
              if (!Number.isInteger(value)) return "Order number must be a whole number"
              if (value < 1000 || value > 9999) return "Order number must be a 4-digit number"
              return true
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Number</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  type="number"
                  min={1000}
                  max={9999}
                  step={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    field.onChange(value)
                  }}
                  value={field.value || ''}
                  placeholder="1000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            type="submit"
            disabled={!form.getValues('number') || form.formState.errors.number}
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}