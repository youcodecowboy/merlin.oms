import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle } from "lucide-react"

const PROBLEM_TYPES = [
  { value: 'MISSING_ITEM', label: 'Item is Missing' },
  { value: 'DAMAGED_QR', label: 'QR Code is Damaged' },
  { value: 'NEEDS_REVIEW', label: 'Item Needs Review' },
  { value: 'APP_ERROR', label: 'Application Error' }
] as const

interface ReportProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  itemSku?: string
}

export function ReportProblemDialog({
  open,
  onOpenChange,
  requestId,
  itemSku
}: ReportProblemDialogProps) {
  const [problemType, setProblemType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!problemType) {
      toast({
        title: "Error",
        description: "Please select a problem type",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Here you would integrate with your reporting system
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Problem Reported",
        description: "Your report has been submitted successfully"
      })
      
      onOpenChange(false)
      setProblemType('')
      setDescription('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a Problem</DialogTitle>
          <DialogDescription>
            {itemSku 
              ? `Report an issue with item ${itemSku}`
              : 'Report an issue with this request'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Problem Type</Label>
            <Select
              value={problemType}
              onValueChange={setProblemType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the type of problem" />
              </SelectTrigger>
              <SelectContent>
                {PROBLEM_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Please provide additional details about the problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !problemType}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 