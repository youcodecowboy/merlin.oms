import { useState } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from '@/lib/stores/notifications'
import type { Request } from '@/lib/schema'
import { useTeamView } from '@/contexts/TeamViewContext'
import { useNavigate } from 'react-router-dom'

export function NotificationBell() {
  const { currentView } = useTeamView()
  const { notifications } = useNotifications()
  const navigate = useNavigate()
  
  // Filter notifications based on team view
  const filteredNotifications = notifications.filter(n => 
    currentView === 'ADMIN' || n.team === currentView
  )

  const handleRequestClick = (request: Request) => {
    navigate(`/requests/${request.id}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {filteredNotifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              {filteredNotifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="p-4 cursor-pointer"
              onClick={() => {
                if (notification.request) {
                  handleRequestClick(notification.request)
                }
              }}
            >
              <div className="space-y-1">
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {notification.description}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
                {notification.request && (
                  <Badge variant="outline" className="mt-2">
                    View Request Details
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 