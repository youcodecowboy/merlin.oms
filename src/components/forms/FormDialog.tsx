import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LoadingSparkle } from "@/components/LoadingSparkle"

interface FormDialogProps {
  title: string
  triggerLabel: string
  loading?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function FormDialog({
  title,
  triggerLabel,
  loading = false,
  open,
  onOpenChange,
  children
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {loading ? (
          <div className="py-8">
            <LoadingSparkle />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {children}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}