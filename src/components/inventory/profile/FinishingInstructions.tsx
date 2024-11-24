import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FinishingInstructionsProps {
  itemId: string
}

export function FinishingInstructions({ itemId }: FinishingInstructionsProps) {
  // Mock data - in real app, fetch this from your API
  const instructions = {
    buttonColor: 'Antique Brass',
    personalization: 'JD',
    hemFinish: 'Original',
    specialInstructions: 'Extra distressing on right pocket'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Finishing Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Button Color</label>
              <div className="mt-1">{instructions.buttonColor}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Personalization</label>
              <div className="mt-1">
                {instructions.personalization ? (
                  <Badge variant="secondary" className="font-mono">
                    {instructions.personalization}
                  </Badge>
                ) : (
                  'None'
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Hem Finish</label>
              <div className="mt-1">{instructions.hemFinish}</div>
            </div>
          </div>

          {instructions.specialInstructions && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Special Instructions</label>
              <div className="mt-1 text-sm bg-muted/50 p-3 rounded-md">
                {instructions.specialInstructions}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}