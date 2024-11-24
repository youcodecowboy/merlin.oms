import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface RequestActionsProps {
  request: any // Replace with proper type
  onComplete: () => void
  onReport: () => void
}

export function RequestActions({ request, onComplete, onReport }: RequestActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={onComplete}
            disabled={request.status === 'COMPLETED'}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Mark as Completed
          </Button>

          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
            size="lg"
            onClick={onReport}
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
            Report a Problem
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}