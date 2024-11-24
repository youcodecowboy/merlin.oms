import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'

export type NotificationType = 'COMMITMENT' | 'ASSIGNMENT' | 'PRODUCTION' | 'WARNING' | 'ERROR'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  timestamp: string
  metadata?: Record<string, any>
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (data: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationStore>()(
  immer((set, get) => ({
    notifications: [],

    addNotification: (data) => {
      set((state) => {
        state.notifications.unshift({
          ...data,
          id: uuidv4(),
          read: false,
          timestamp: new Date().toISOString()
        })
      })
    },

    markAsRead: (id) => {
      set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        if (notification) {
          notification.read = true
        }
      })
    },

    markAllAsRead: () => {
      set((state) => {
        state.notifications.forEach(n => {
          n.read = true
        })
      })
    },

    clearNotifications: () => {
      set((state) => {
        state.notifications = []
      })
    },

    getUnreadCount: () => {
      return get().notifications.filter(n => !n.read).length
    }
  }))
)