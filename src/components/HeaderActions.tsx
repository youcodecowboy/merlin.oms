import { ModeToggle } from "./mode-toggle"
import { NotificationsPopover } from "./notifications/NotificationsPopover"
import { useEffect } from "react"
import { createMockNotification, getUserNotifications } from "@/lib/mock-api/notifications"

export function HeaderActions() {
  useEffect(() => {
    const initializeNotifications = async () => {
      // First check if we have any existing notifications
      const existing = await getUserNotifications('current_user')
      console.log('Existing notifications:', existing)

      // If no notifications exist, create a test one
      if (existing.length === 0) {
        console.log('Creating test notification...')
        await createMockNotification({
          userId: 'current_user',
          type: 'REQUEST_ASSIGNED',
          title: 'Test Notification',
          message: 'This is a test notification',
          metadata: {
            requestId: 'test_123'
          }
        })
        
        // Verify the notification was created
        const updated = await getUserNotifications('current_user')
        console.log('Updated notifications:', updated)
      }
    }

    initializeNotifications()
  }, [])

  return (
    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      <NotificationsPopover />
      <ModeToggle />
    </div>
  )
} 