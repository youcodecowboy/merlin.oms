import React from 'react'
import { Button } from "@/components/ui/button"

interface FormStageProps {
  title: string
  onNext?: () => void
  onBack?: () => void
  isValid?: boolean
  isLoading?: boolean
  submitLabel?: string
  backLabel?: string
  children: React.ReactNode
}

export function FormStage({
  title,
  onNext,
  onBack,
  isValid = true,
  isLoading = false,
  submitLabel = "Next",
  backLabel = "Back",
  children
}: FormStageProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {children}
      </div>

      <div className="flex justify-between">
        {onBack && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isLoading}
          >
            {backLabel}
          </Button>
        )}
        {onNext && (
          <Button 
            type="submit"
            disabled={!isValid || isLoading}
            className={onBack ? "" : "ml-auto"}
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  )
}