import { useCallback } from 'react'
import { useNotificationStore, type NotificationType } from '@/lib/stores/notificationStore'

export function useNotifications() {
  const addNotification = useNotificationStore(state => state.addNotification)
  const markAsRead = useNotificationStore(state => state.markAsRead)
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead)
  const getUnreadCount = useNotificationStore(state => state.getUnreadCount)

  const notify = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) => {
    addNotification({
      type,
      title,
      message,
      metadata
    })
  }, [addNotification])

  return {
    notify,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  }
}