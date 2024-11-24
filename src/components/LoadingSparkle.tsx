import { cn } from "@/lib/utils"

interface LoadingSparkleProps {
  className?: string
}

export function LoadingSparkle({ className }: LoadingSparkleProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative w-12 h-12">
        {/* Outer sparkle */}
        <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
          <div className="w-3 h-3 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
          <div className="w-3 h-3 bg-primary rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
          <div className="w-3 h-3 bg-primary rounded-full absolute left-0 top-1/2 -translate-y-1/2" />
          <div className="w-3 h-3 bg-primary rounded-full absolute right-0 top-1/2 -translate-y-1/2" />
        </div>
        
        {/* Inner sparkle */}
        <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
          <div className="w-2 h-2 bg-primary/70 rounded-full absolute top-1 left-1/2 -translate-x-1/2" />
          <div className="w-2 h-2 bg-primary/70 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
          <div className="w-2 h-2 bg-primary/70 rounded-full absolute left-1 top-1/2 -translate-y-1/2" />
          <div className="w-2 h-2 bg-primary/70 rounded-full absolute right-1 top-1/2 -translate-y-1/2" />
        </div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}