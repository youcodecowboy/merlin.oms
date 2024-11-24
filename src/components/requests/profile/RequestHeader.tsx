import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface RequestHeaderProps {
  request: any // Replace with proper type
}

export function RequestHeader({ request }: RequestHeaderProps) {
  const timeRemaining = formatDistanceToNow(request.dueDate, { addSuffix: true })
  const isUrgent = new Date(request.dueDate).getTime() - Date.now() < 3600000 // Less than 1 hour

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{request.title}</h1>
            <Badge
              className={cn(
                request.status === 'PENDING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                request.status === 'IN_PROGRESS' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                request.status === 'COMPLETED' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              )}
            >
              {request.status}
            </Badge>
            <Badge
              className={cn(
                request.priority === 'HIGH' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                request.priority === 'MEDIUM' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                request.priority === 'LOW' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              )}
            >
              {request.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Request ID: {request.id}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={request.assignedTo.avatar} />
              <AvatarFallback>
                {request.assignedTo.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{request.assignedTo.name}</p>
              <p className="text-muted-foreground">Assigned</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full",
            isUrgent ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
            "bg-muted text-muted-foreground"
          )}>
            {isUrgent ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              Due {timeRemaining}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}