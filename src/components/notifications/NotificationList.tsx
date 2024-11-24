import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from 'date-fns'
import { cn } from "@/lib/utils"
import type { Notification } from '@/lib/stores/notificationStore'

interface NotificationListProps {
  notifications: Notification[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No notifications
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 rounded-lg space-y-1",
              !notification.read && "bg-muted/50"
            )}
          >
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  notification.type === 'ERROR' ? 'destructive' :
                  notification.type === 'WARNING' ? 'warning' :
                  'secondary'
                }
              >
                {notification.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>
            </div>
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            {notification.metadata && (
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}