import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface RequestInstructionsProps {
  request: any // Replace with proper type
  onEditNotes: () => void
}

export function RequestInstructions({ request, onEditNotes }: RequestInstructionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Instructions</CardTitle>
        <Button variant="outline" size="sm" onClick={onEditNotes}>
          <FileText className="h-4 w-4 mr-2" />
          Edit Notes
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p>{request.instructions}</p>
        </div>

        {request.notes && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm">{request.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}