import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, ArrowRight } from "lucide-react"
import type { DBRequest } from '@/lib/schema/database'

interface RequestHistoryProps {
  requests: DBRequest[]
  activeRequest: DBRequest | null
  onRequestClick?: (request: DBRequest) => void
}

export function RequestHistory({ requests, activeRequest, onRequestClick }: RequestHistoryProps) {
  const [selectedTab, setSelectedTab] = useState<string>(activeRequest?.id || 'active')

  const getRequestProgress = (request: DBRequest) => {
    const steps = request.metadata?.steps || []
    const completed = steps.filter(s => s.status === 'COMPLETED').length
    return {
      completed,
      total: steps.length,
      percentage: (completed / steps.length) * 100
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full">
            {activeRequest && (
              <TabsTrigger value="active" className="flex-1">
                Active Request
                <Badge variant="secondary" className="ml-2">
                  {activeRequest.request_type}
                </Badge>
              </TabsTrigger>
            )}
            {requests.map((request) => (
              <TabsTrigger 
                key={request.id} 
                value={request.id}
                className="flex-1"
              >
                {request.request_type}
                <Badge 
                  variant={request.status === 'COMPLETED' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {request.status}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {activeRequest && (
            <TabsContent value="active" className="mt-4">
              <RequestDetails request={activeRequest} onClick={onRequestClick} />
            </TabsContent>
          )}

          {requests.map((request) => (
            <TabsContent key={request.id} value={request.id} className="mt-4">
              <RequestDetails request={request} onClick={onRequestClick} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function RequestDetails({ request, onClick }: { request: DBRequest, onClick?: (request: DBRequest) => void }) {
  const progress = getRequestProgress(request)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Request #{request.id}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {new Date(request.created_at).toLocaleString()}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onClick?.(request)}
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span className="text-muted-foreground">
            {progress.completed} of {progress.total} steps completed
          </span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>

      {request.metadata?.steps?.map((step: any, index: number) => (
        <div 
          key={step.id}
          className="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border text-sm">
              {index + 1}
            </div>
            <span className="text-sm font-medium">{step.title}</span>
          </div>
          <Badge variant={
            step.status === 'COMPLETED' ? 'default' :
            step.status === 'IN_PROGRESS' ? 'secondary' :
            'outline'
          }>
            {step.status}
          </Badge>
        </div>
      ))}
    </div>
  )
} 