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

// Initialize with default notifications
const defaultNotifications: Notification[] = [
  {
    id: 'notif_001',
    userId: 'current_user',
    type: 'REQUEST_ASSIGNED',
    title: 'New Stock Pull Request',
    message: 'You have been assigned to pull ST-32-X-32-IND from stock',
    read: false,
    metadata: {
      requestId: 'req_001',
      requestType: 'STOCK_PULL',
      sku: 'ST-32-X-32-IND'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
  },
  {
    id: 'notif_002',
    userId: 'current_user',
    type: 'REQUEST_COMPLETED',
    title: 'Pattern Request Completed',
    message: 'Pattern request for batch BATCH-123 has been completed',
    read: true,
    metadata: {
      requestId: 'req_002',
      requestType: 'PATTERN_REQUEST',
      batchId: 'BATCH-123'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
  },
  {
    id: 'notif_003',
    userId: 'current_user',
    type: 'REQUEST_UPDATED',
    title: 'Wash Request Updated',
    message: 'Wash request status updated to IN_PROGRESS',
    read: false,
    metadata: {
      requestId: 'req_003',
      requestType: 'WASH_REQUEST',
      newStatus: 'IN_PROGRESS'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  }
]

// Load persisted data or use defaults
const loadPersistedData = () => {
  try {
    const savedNotifications = localStorage.getItem('mockNotifications')
    return savedNotifications ? JSON.parse(savedNotifications) : defaultNotifications
  } catch (error) {
    console.error('Failed to load notifications:', error)
    return defaultNotifications
  }
}

// Initialize with persisted or default data
const notifications = loadPersistedData()

// Helper function to persist data
const persistData = () => {
  try {
    localStorage.setItem('mockNotifications', JSON.stringify(notifications))
  } catch (error) {
    console.error('Failed to persist notifications:', error)
  }
}

export async function createMockNotification(data: Omit<Notification, 'id' | 'read' | 'created_at'>): Promise<Notification> {
  const notification: Notification = {
    id: `notif_${nanoid()}`,
    ...data,
    read: false,
    created_at: new Date().toISOString()
  }

  notifications.push(notification)
  persistData()
  return notification
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
  return notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200)) // Simulate API delay
  const notification = notifications.find(n => n.id === id)
  if (notification) {
    notification.read = true
    persistData()
  }
}

// Export for testing
export { notifications as mockNotifications } 