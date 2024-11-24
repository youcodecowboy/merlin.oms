import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, ArrowUpRight } from "lucide-react"
import type { Order, OrderItem } from "@/lib/schema"

interface TimelineEvent {
  id: string
  type: string
  timestamp: string
  team: string
  description: string
  stage?: string
}

interface OrderTimelineProps {
  order: Order
  onInventoryItemClick: (item: any) => void
}

// Helper function to expand order items into individual units
function expandOrderItems(items: OrderItem[]): OrderItem[] {
  return items.flatMap(item => 
    Array.from({ length: item.quantity }, (_, index) => ({
      ...item,
      id: `${item.id}-${index + 1}`,
      quantity: 1,
      unit: index + 1
    }))
  )
}

export function OrderTimeline({
  order,
  onInventoryItemClick
}: OrderTimelineProps) {
  const [loading, setLoading] = useState(true)
  const [itemTimelines, setItemTimelines] = useState<Record<string, TimelineEvent[]>>({})

  // Create expanded items from order items
  const expandedItems = expandOrderItems(order.items || [])

  useEffect(() => {
    const fetchTimelines = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockTimelines: Record<string, TimelineEvent[]> = {}
      expandedItems.forEach((item) => {
        mockTimelines[item.id] = [
          {
            id: '1',
            type: 'STAGE_CHANGE',
            timestamp: new Date().toISOString(),
            team: 'Cutting Team',
            description: 'Cutting Started',
            stage: 'CUTTING'
          },
          {
            id: '2',
            type: 'NOTE',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            team: 'Production',
            description: 'Materials prepared for cutting'
          }
        ]
      })

      setItemTimelines(mockTimelines)
      setLoading(false)
    }

    fetchTimelines()

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchTimelines()
    }, 30000)

    return () => clearInterval(interval)
  }, [expandedItems])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Tabs defaultValue={expandedItems[0]?.id}>
      <TabsList className="w-full h-auto flex-wrap">
        {expandedItems.map((item) => (
          <TabsTrigger key={item.id} value={item.id} className="flex-1">
            Unit {item.unit}
          </TabsTrigger>
        ))}
      </TabsList>

      {expandedItems.map((item) => {
        const timeline = itemTimelines[item.id] || []
        const currentStage = timeline.find(e => e.type === 'STAGE_CHANGE')?.stage || 'PENDING'

        return (
          <TabsContent key={item.id} value={item.id}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Unit {item.unit}</h3>
                    <p className="text-sm font-mono text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        currentStage === 'CUTTING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                        currentStage === 'SEWING' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        currentStage === 'WASHING' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                        currentStage === 'FINISHING' && "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
                        currentStage === 'QC' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                        currentStage === 'READY' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}
                    >
                      {currentStage}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onInventoryItemClick(item)}
                    >
                      View Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-muted space-y-4">
                  {timeline.map((event, index) => (
                    <div
                      key={event.id}
                      className={cn(
                        "relative pb-4",
                        index === timeline.length - 1 && "pb-0"
                      )}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-background border-2 border-primary" />
                      
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{event.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.team}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.timestamp), 'PPp')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}