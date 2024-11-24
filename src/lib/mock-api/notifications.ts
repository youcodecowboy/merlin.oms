import { nanoid } from 'nanoid'

export interface Notification {
  id: string
  userId: string
  type: 'REQUEST_ASSIGNED' | 'REQUEST_COMPLETED' | 'REQUEST_UPDATED'
  title: string
  message: string
  read: boolean
  metadata: Record<string, any>
  created_at: string
}

let mockNotifications: Notification[] = []

export async function createMockNotification(data: Omit<Notification, 'id' | 'read' | 'created_at'>): Promise<Notification> {
  const notification: Notification = {
    id: `notif_${nanoid()}`,
    ...data,
    read: false,
    created_at: new Date().toISOString()
  }

  mockNotifications.push(notification)
  return notification
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  return mockNotifications.filter(n => n.userId === userId)
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const notification = mockNotifications.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
} 