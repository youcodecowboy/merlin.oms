import { useState, useEffect } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { useNotificationStore } from '@/lib/stores/notificationStore'
import { NotificationList } from './NotificationList'
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const notifications = useNotificationStore(state => state.notifications)
  const unreadCount = useNotificationStore(state => state.getUnreadCount())
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead)

  // Auto-close popover when all notifications are read
  useEffect(() => {
    if (unreadCount === 0 && open) {
      const timer = setTimeout(() => setOpen(false), 500)
      return () => clearTimeout(timer)
    }
  }, [unreadCount, open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => {
            setOpen(true)
            if (unreadCount > 0) {
              markAllAsRead()
            }
          }}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center",
                "bg-red-500 text-white border-background"
              )}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-80 max-h-[500px] overflow-auto"
      >
        <NotificationList notifications={notifications} />
      </PopoverContent>
    </Popover>
  )
}