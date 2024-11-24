import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, AlertTriangle, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from 'date-fns'

interface ActiveRequestCardProps {
  itemId: string
}

export function ActiveRequestCard({ itemId }: ActiveRequestCardProps) {
  // Mock data - in real app, fetch this from your API
  const request = {
    id: 'REQ-001',
    title: 'WASH REQUEST',
    instructions: 'Move unit to Bin STA, scan bin, confirm action.',
    priority: 'URGENT',
    assignedTo: 'John Smith',
    currentLocation: 'BIN-123',
    nextBin: 'STA-001',
    createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    dueDate: new Date(Date.now() + 3600000) // 1 hour from now
  }

  const handleComplete = () => {
    console.log('Completing request for item:', itemId)
  }

  const handleReport = () => {
    console.log('Reporting issue for item:', itemId)
  }

  const isDueSoon = new Date(request.dueDate).getTime() - Date.now() < 1800000 // 30 minutes

  return (
    <Card className="bg-muted/50 border-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">ID: {request.id}</p>
            <Badge
              className={cn(
                request.priority === 'URGENT' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                request.priority === 'HIGH' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                request.priority === 'MEDIUM' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              )}
            >
              {request.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Current: <span className="font-mono">{request.currentLocation}</span>
            </div>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">Assigned to:</p>
          <p className="font-medium">{request.assignedTo}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Request Details Card */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{request.title}</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="flex-1">{request.instructions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Next Location:</span>
              <Badge variant="secondary" className="font-mono">
                {request.nextBin}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps and Actions */}
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">
              Created {formatDistanceToNow(request.createdAt)} ago
            </p>
            <p className={cn(
              "font-medium",
              isDueSoon && "text-red-600 dark:text-red-400"
            )}>
              Due in {formatDistanceToNow(request.dueDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleReport}
              className="text-red-600 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report
            </Button>
            <Button onClick={handleComplete}>
              Complete
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}