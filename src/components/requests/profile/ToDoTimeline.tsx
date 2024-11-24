import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { QrCode, MapPin, CheckCircle2, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'

interface Step {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  completedAt?: string
  completedBy?: string
  action?: {
    label: string
    type: 'SCAN_QR' | 'SCAN_BIN' | 'CONFIRM'
    onClick: () => void
  }
}

interface ToDoTimelineProps {
  steps: Step[]
  onStepComplete: (stepId: string) => void
}

export function ToDoTimeline({ steps, onStepComplete }: ToDoTimelineProps) {
  const completedSteps = steps.filter(step => step.status === 'COMPLETED').length
  const progress = (completedSteps / steps.length) * 100

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'SCAN_QR':
        return <QrCode className="h-4 w-4" />
      case 'SCAN_BIN':
        return <MapPin className="h-4 w-4" />
      case 'CONFIRM':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg">Next Steps to Complete</CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{completedSteps} of {steps.length} steps completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l-2 border-muted space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "relative pb-4",
                index === steps.length - 1 && "pb-0"
              )}
            >
              {/* Timeline dot */}
              <div 
                className={cn(
                  "absolute -left-[25px] w-4 h-4 rounded-full bg-background border-2",
                  step.status === 'COMPLETED' && "border-green-500",
                  step.status === 'IN_PROGRESS' && "border-blue-500",
                  step.status === 'PENDING' && "border-muted-foreground"
                )}
              />
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <Badge
                        className={cn(
                          step.status === 'COMPLETED' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                          step.status === 'IN_PROGRESS' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                          step.status === 'PENDING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        )}
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {step.status === 'COMPLETED' ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Clock className="h-4 w-4" />
                    <span>Completed {format(new Date(step.completedAt!), 'PPp')}</span>
                    {step.completedBy && (
                      <span>by {step.completedBy}</span>
                    )}
                  </div>
                ) : step.action && (
                  <Button
                    className="mt-2"
                    onClick={() => onStepComplete(step.id)}
                    disabled={step.status === 'PENDING'}
                  >
                    {getStepIcon(step.action.type)}
                    <span className="ml-2">{step.action.label}</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}