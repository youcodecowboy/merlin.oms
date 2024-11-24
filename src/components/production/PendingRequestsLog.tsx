import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProductionStore } from '@/lib/stores/productionStore'
import { useProductionLogger } from '@/lib/stores/productionLogger'
import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'
import { cn } from "@/lib/utils"

export function PendingRequestsLog() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'with-orders' | 'no-orders'>('all')
  const requests = useProductionStore(state => state.requests)
  const logs = useProductionLogger(state => state.logs)

  const filteredRequests = requests.filter(request => {
    const matchesSearch = search === '' || 
      request.sku.toLowerCase().includes(search.toLowerCase()) ||
      request.universalSku?.toLowerCase().includes(search.toLowerCase()) ||
      request.customerName?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter = filter === 'all' ||
      (filter === 'with-orders' && request.orderId) ||
      (filter === 'no-orders' && !request.orderId)

    return matchesSearch && matchesFilter
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Production Requests Log</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(current => 
                current === 'all' ? 'with-orders' : 
                current === 'with-orders' ? 'no-orders' : 'all'
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'all' ? 'All' : 
               filter === 'with-orders' ? 'With Orders' : 
               'No Orders'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const requestLogs = logs.filter(log => 
              log.details.sku === request.sku || 
              log.details.universalSku === request.universalSku
            )

            return (
              <div
                key={request.id}
                className="p-4 bg-muted/50 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono">{request.sku}</span>
                      {request.universalSku && request.universalSku !== request.sku && (
                        <Badge variant="outline" className="font-mono">
                          Universal: {request.universalSku}
                        </Badge>
                      )}
                    </div>
                    {request.orderId && (
                      <div className="text-sm text-muted-foreground">
                        Order #{request.orderNumber} - {request.customerName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        request.priority === 'URGENT' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                        request.priority === 'HIGH' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                        request.priority === 'MEDIUM' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                        request.priority === 'LOW' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}
                    >
                      {request.priority}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        request.status === 'PENDING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                        request.status === 'IN_PROGRESS' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        request.status === 'COMPLETED' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>

                {/* Activity Timeline */}
                {requestLogs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Activity</h4>
                    <div className="space-y-2">
                      {requestLogs.map((log) => (
                        <div
                          key={log.id}
                          className="text-sm flex items-center justify-between p-2 bg-background rounded"
                        >
                          <span>{log.details.message}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(log.timestamp), 'PPp')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filteredRequests.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No production requests found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}