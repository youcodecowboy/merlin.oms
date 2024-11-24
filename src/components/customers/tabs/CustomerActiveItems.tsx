import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { format, addDays } from 'date-fns'
import { cn } from "@/lib/utils"

interface ActiveItem {
  id: string
  sku: string
  stage: string
  startDate: string
  expectedCompletion: string
  progress: number
}

interface CustomerActiveItemsProps {
  customerId: string
}

export function CustomerActiveItems({ customerId }: CustomerActiveItemsProps) {
  const [items, setItems] = useState<ActiveItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockItems = [{
      id: '1',
      sku: 'ST-32-S-32-RAW',
      stage: 'CUTTING',
      startDate: new Date().toISOString(),
      expectedCompletion: addDays(new Date(), 7).toISOString(),
      progress: 20
    }, {
      id: '2',
      sku: 'SL-30-R-34-BLK',
      stage: 'SEWING',
      startDate: new Date().toISOString(),
      expectedCompletion: addDays(new Date(), 5).toISOString(),
      progress: 40
    }]

    setItems(mockItems)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()

    // Set up polling for real-time updates
    const interval = setInterval(fetchItems, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchItems])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active items in production</p>
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-mono font-medium">{item.sku}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Started: {format(new Date(item.startDate), 'PP')}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "px-2 py-1",
                    item.stage === 'CUTTING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    item.stage === 'SEWING' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    item.stage === 'WASHING' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                    item.stage === 'FINISHING' && "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
                    item.stage === 'QC' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  )}
                >
                  {item.stage}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{item.progress}% Complete</span>
                <span>
                  Expected: {format(new Date(item.expectedCompletion), 'PP')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}