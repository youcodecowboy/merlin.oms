import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
}

export function LoadingSpinner({ 
  size = "default", 
  className,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center",
        className
      )}
      {...props}
    >
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          {
            "h-4 w-4": size === "sm",
            "h-8 w-8": size === "default",
            "h-12 w-12": size === "lg",
          }
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}