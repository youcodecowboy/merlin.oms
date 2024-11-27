import * as React from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  title?: string
  description?: string
  side?: "left" | "right" | "top" | "bottom"
}

export function Drawer({
  open,
  onOpenChange,
  children,
  title,
  description,
  side = "right",
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={side}
        className={cn(
          "flex flex-col h-full",
          side === "top" || side === "bottom" ? "h-[80vh]" : "w-[90vw] max-w-[600px]"
        )}
      >
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
          </SheetHeader>
        )}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
} 