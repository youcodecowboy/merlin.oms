import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Bin } from "@/lib/schema/bins"

interface BinCapacityIndicatorProps {
  bin: Bin
  className?: string
}

export function BinCapacityIndicator({ bin, className }: BinCapacityIndicatorProps) {
  const usagePercentage = (bin.current_items / bin.capacity) * 100
  
  const getStatusColor = () => {
    if (usagePercentage === 0) return 'bg-muted-foreground/20'
    if (usagePercentage >= 90) return 'bg-destructive'
    if (usagePercentage >= 70) return 'bg-yellow-500'
    return 'bg-primary'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Capacity Usage</span>
          <Badge variant={
            usagePercentage === 0 ? 'outline' :
            usagePercentage >= 90 ? 'destructive' : 
            'secondary'
          }>
            {Math.round(usagePercentage)}%
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {bin.current_items} / {bin.capacity} slots
        </span>
      </div>
      <Progress 
        value={usagePercentage || 0} 
        className="h-4"
        indicatorClassName={getStatusColor()}
      />
      {usagePercentage >= 90 ? (
        <p className="text-sm text-destructive">Bin is nearly full</p>
      ) : usagePercentage === 0 ? (
        <p className="text-sm text-muted-foreground">Bin is empty</p>
      ) : null}
    </div>
  )
} 