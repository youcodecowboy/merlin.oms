import { useCallback, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Plus, Trash } from "lucide-react"
import { SKUField } from "../SKUField"

interface ItemsStageProps {
  form: UseFormReturn<any>
  onNext: () => void
  onBack: () => void
}

export function ItemsStage({ 
  form, 
  onNext, 
  onBack 
}: ItemsStageProps) {
  const items = form.watch("items") || []

  const initializeItems = useCallback(() => {
    if (items.length === 0) {
      form.setValue("items", [
        {
          sku: "",
          style: "",
          waist: 28,
          shape: "",
          inseam: 30,
          wash: "",
          hem: "RWH",
          quantity: 1
        }
      ])
    }
  }, [form, items.length])

  useEffect(() => {
    initializeItems()
  }, [initializeItems])

  const addItem = () => {
    form.setValue("items", [
      ...items,
      {
        sku: "",
        style: "",
        waist: 28,
        shape: "",
        inseam: 30,
        wash: "",
        hem: "RWH",
        quantity: 1
      }
    ])
  }

  const removeItem = (index: number) => {
    form.setValue("items", items.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Order Items</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.map((_, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <h5 className="text-sm font-medium">Item {index + 1}</h5>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <SKUField index={index} />
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            type="submit"
            disabled={items.length === 0 || !items.every(item => item.sku)}
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}