import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QrCode, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { mockDB, updateRequestSteps } from '@/lib/mock-db/store'
import { getWashTypeFromSkus } from '@/lib/schema/database'
import type { DBRequest } from '@/lib/schema/database'

interface StepsCardProps {
  request: DBRequest
  onUpdate?: () => void
}

export function StepsCard({ request, onUpdate }: StepsCardProps) {
  const { toast } = useToast()

  // Get the inventory item
  const item = mockDB.inventory_items.find(i => i.id === request.item_id)
  if (!item) return null

  // Get wash type from SKUs
  const washType = getWashTypeFromSkus(item.current_sku, item.target_sku)

  // Calculate progress
  const steps = request.metadata?.steps || []
  const completedSteps = steps.filter(step => step.status === 'COMPLETED').length

  const handleCompleteStep = async (stepId: string) => {
    try {
      // Find the step
      const currentStep = steps.find(s => s.id === stepId)
      if (!currentStep) return

      // For step 2, validate the bin scan
      if (stepId === '2') {
        // In real implementation, this would be the scanned bin code
        const scannedBin = `WASH-${washType.wash}`
        if (scannedBin !== request.metadata?.assigned_bin) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Incorrect bin scanned. Please scan ${washType.name} bin.`
          })
          return
        }
      }

      // Update step status
      currentStep.status = 'COMPLETED'
      currentStep.completed_at = new Date().toISOString()

      // Find next step and set it to in progress
      const nextStep = steps.find(s => s.status === 'PENDING')
      if (nextStep) {
        nextStep.status = 'IN_PROGRESS'
      }

      // Update request in mock DB
      updateRequestSteps(request.id, steps)

      // Show success message
      toast({
        title: "Step Completed",
        description: `Completed: ${currentStep.title}`
      })

      // If completing final step, move item to assigned bin
      if (stepId === '3') {
        const requestIndex = mockDB.requests.findIndex(r => r.id === request.id)
        if (requestIndex > -1) {
          // Move item to wash bin
          const itemIndex = mockDB.inventory_items.findIndex(i => i.id === request.item_id)
          if (itemIndex > -1) {
            mockDB.inventory_items[itemIndex].location = request.metadata?.assigned_bin
          }
          // Remove request
          mockDB.requests.splice(requestIndex, 1)
        }
      }

      // Trigger parent update
      if (onUpdate) onUpdate()

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete step"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{completedSteps} of {steps.length} steps completed</span>
        </div>
        <Progress 
          value={(completedSteps / steps.length) * 100} 
          className="h-1 bg-secondary"
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className="rounded-lg border bg-card text-card-foreground p-4 space-y-3"
          >
            {/* Step Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border text-sm font-medium">
                  {index + 1}
                </div>
                <h3 className="font-medium">{step.title}</h3>
              </div>
              <Badge variant={
                step.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
              }>
                {step.status === 'IN_PROGRESS' ? 'In Progress' : step.status}
              </Badge>
            </div>

            {/* Step Description */}
            <p className="text-sm text-muted-foreground">
              {step.description}
            </p>

            {/* Show target bin for step 2 */}
            {step.id === '2' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">Target Bin:</span>
                <Badge variant="secondary" className="font-mono">
                  {washType.name}
                </Badge>
              </div>
            )}

            {/* Action Button */}
            {step.status === 'IN_PROGRESS' && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleCompleteStep(step.id)}
              >
                {index < 2 ? (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Placement
                  </>
                )}
              </Button>
            )}

            {/* Show completion time if completed */}
            {step.status === 'COMPLETED' && step.completed_at && (
              <div className="text-sm text-muted-foreground">
                Completed at: {new Date(step.completed_at).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 