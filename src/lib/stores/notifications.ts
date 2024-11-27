import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Request } from '@/lib/schema'
import { TeamType } from '@/lib/schema/accounts'

export interface AppNotification {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'REQUEST' | 'INFO' | 'WARNING' | 'ERROR'
  request?: Request
  metadata?: Record<string, any>
  read: boolean
  team?: TeamType
}

interface NotificationStore {
  notifications: AppNotification[]
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  clearNotification: (id: string) => void
  clearAll: () => void
}

export const useNotifications = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
          },
          ...state.notifications
        ]
      })),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      clearNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearAll: () => set({ notifications: [] })
    }),
    {
      name: 'notifications-storage'
    }
  )
) 