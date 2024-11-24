import { useEventLogStore } from '@/lib/stores/eventLogStore'
import { useNotificationStore } from '@/lib/stores/notificationStore'
import { useCommitmentsStore } from '@/lib/stores/commitmentsStore'
import { useAssignmentStore } from '@/lib/stores/assignmentStore'

describe('Logging and Notifications System', () => {
  beforeEach(() => {
    useEventLogStore.setState({ events: [] })
    useNotificationStore.setState({ notifications: [] })
    useCommitmentsStore.setState({ commitments: [] })
    useAssignmentStore.setState({ assignments: [] })
  })

  describe('Commitment Logging', () => {
    it('logs commitment creation', () => {
      const commitmentStore = useCommitmentsStore.getState()
      commitmentStore.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      const events = useEventLogStore.getState().events
      expect(events.length).toBe(1)
      expect(events[0].type).toBe('COMMITMENT_CREATED')
      expect(events[0].entityType).toBe('ORDER')
      expect(events[0].entityId).toBe('order-1')
    })

    it('includes universal SKU details in logs', () => {
      const commitmentStore = useCommitmentsStore.getState()
      commitmentStore.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      const events = useEventLogStore.getState().events
      expect(events[0].metadata).toHaveProperty('universalSku', 'ST-32-S-36-RAW')
    })
  })

  describe('Assignment Logging', () => {
    it('logs assignment creation in both order and inventory logs', () => {
      // Create commitment first
      const commitmentStore = useCommitmentsStore.getState()
      commitmentStore.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      // Create assignment
      const assignmentStore = useAssignmentStore.getState()
      assignmentStore.assignInventoryItem({
        inventoryItemId: 'item-1',
        sku: 'ST-32-S-36-RAW',
        status1: 'STOCK',
        status2: 'UNCOMMITTED'
      })

      const events = useEventLogStore.getState().events
      const orderEvents = events.filter(e => e.entityType === 'ORDER')
      const inventoryEvents = events.filter(e => e.entityType === 'INVENTORY')

      expect(orderEvents.length).toBeGreaterThan(0)
      expect(inventoryEvents.length).toBeGreaterThan(0)
    })
  })

  describe('Notifications', () => {
    it('creates notification for new assignments', () => {
      // Create and fulfill commitment
      const commitmentStore = useCommitmentsStore.getState()
      commitmentStore.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      const assignmentStore = useAssignmentStore.getState()
      assignmentStore.assignInventoryItem({
        inventoryItemId: 'item-1',
        sku: 'ST-32-S-36-RAW',
        status1: 'STOCK',
        status2: 'UNCOMMITTED'
      })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications.length).toBeGreaterThan(0)
      expect(notifications[0].type).toBe('ASSIGNMENT')
    })

    it('includes relevant details in notifications', () => {
      // Create and fulfill commitment
      const commitmentStore = useCommitmentsStore.getState()
      commitmentStore.addCommitment({
        sku: 'ST-32-S-30-STA',
        orderId: 'order-1',
        orderNumber: 1001,
        quantity: 1
      })

      const assignmentStore = useAssignmentStore.getState()
      assignmentStore.assignInventoryItem({
        inventoryItemId: 'item-1',
        sku: 'ST-32-S-36-RAW',
        status1: 'STOCK',
        status2: 'UNCOMMITTED'
      })

      const notification = useNotificationStore.getState().notifications[0]
      expect(notification.metadata).toHaveProperty('orderNumber')
      expect(notification.metadata).toHaveProperty('sku')
      expect(notification.metadata).toHaveProperty('inventoryItemId')
    })
  })
})