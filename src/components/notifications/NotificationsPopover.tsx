import { useState, useEffect } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell } from "lucide-react"
import { getUserNotifications, markNotificationAsRead } from '@/lib/mock-api/notifications'
import { format } from 'date-fns'
import type { Notification } from '@/lib/mock-api/notifications'

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      console.log('Loading notifications...')
      const result = await getUserNotifications('current_user')
      console.log('Loaded notifications:', result)
      setNotifications(result)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      )
    }
    // Handle navigation based on notification type
    if (notification.type === 'REQUEST_ASSIGNED') {
      console.log('Navigate to request:', notification.metadata.requestId)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Notifications</h4>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={loadNotifications}
              >
                Refresh
              </Button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`w-full text-left p-3 rounded-lg text-sm space-y-1 hover:bg-muted ${
                      !notification.read ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), 'PPp')}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No notifications
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
} 