import { nanoid } from 'nanoid'
import type { TrackingEvent, EventCategory, EventType, EventMetadata, EventChain, EventClassifier } from '../schema/events'

const STORAGE_KEY = 'tracking-events'

// Default system operator
const SYSTEM_OPERATOR = {
  id: 'system',
  type: 'system' as const,
  name: 'System'
}

export class EventTracker {
  private events: Map<string, TrackingEvent> = new Map()
  private itemEvents: Map<string, string[]> = new Map() // item_id -> event_ids
  private eventChains: Map<string, EventChain> = new Map()

  constructor() {
    this.loadEvents()
  }

  private loadEvents() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Convert the plain objects back to Map instances
        this.events = new Map(Object.entries(parsed.events || {}))
        this.itemEvents = new Map(Object.entries(parsed.itemEvents || {}))
        this.eventChains = new Map(Object.entries(parsed.eventChains || {}))
      } catch (error) {
        console.error('Failed to load events:', error)
        // Initialize empty maps if loading fails
        this.events = new Map()
        this.itemEvents = new Map()
        this.eventChains = new Map()
      }
    }
  }

  private async persistEvents(): Promise<void> {
    try {
      const data = {
        events: Object.fromEntries(this.events),
        itemEvents: Object.fromEntries(this.itemEvents),
        eventChains: Object.fromEntries(this.eventChains)
      }
      console.log('Persisting data:', data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      
      // Verify persistence
      const saved = localStorage.getItem(STORAGE_KEY)
      console.log('Saved data:', saved)
    } catch (error) {
      console.error('Failed to persist events:', error)
    }
  }

  async createEvent(
    category: EventCategory,
    type: EventType[keyof EventType][keyof EventType[keyof EventType]],
    metadata: Omit<EventMetadata, 'operator' | 'classifier'>,
    parentEventId?: string,
    options: {
      operator?: {
        id: string
        type: 'system' | 'user'
        name: string
      }
      classifier?: EventClassifier
    } = {}
  ): Promise<TrackingEvent> {
    console.log('Creating event:', { category, type, metadata, parentEventId })

    // Determine classifier based on type
    let classifier: EventClassifier = options.classifier || this.determineClassifier(category, type)

    const event: TrackingEvent = {
      id: nanoid(),
      category,
      type,
      metadata: {
        ...metadata,
        operator: options.operator || SYSTEM_OPERATOR,
        classifier
      },
      parent_event_id: parentEventId,
      child_event_ids: [],
      created_at: new Date().toISOString(),
      classifier
    }

    // Store the event
    this.events.set(event.id, event)
    console.log('Stored event:', event)
    console.log('Current events:', Array.from(this.events.values()))

    // Update item -> events mapping if item_id exists in metadata
    if ('item_id' in metadata) {
      const itemEvents = this.itemEvents.get(metadata.item_id) || []
      itemEvents.push(event.id)
      this.itemEvents.set(metadata.item_id, itemEvents)
      console.log('Updated item events:', this.itemEvents)
    }

    // Update parent-child relationships
    if (parentEventId) {
      const parentEvent = this.events.get(parentEventId)
      if (parentEvent) {
        parentEvent.child_event_ids = [...(parentEvent.child_event_ids || []), event.id]
        this.events.set(parentEventId, parentEvent)
        console.log('Updated parent event:', parentEvent)
      }
    }

    // Update event chains
    this.updateEventChains(event)

    // Persist changes
    await this.persistEvents()
    console.log('Events persisted to localStorage')

    return event
  }

  private updateEventChains(event: TrackingEvent) {
    if (!event.parent_event_id) {
      // This is a root event
      const chain: EventChain = {
        root_event_id: event.id,
        events: [event],
        branches: {}
      }
      this.eventChains.set(event.id, chain)
    } else {
      // Add to existing chain
      const parentChain = this.findChainForEvent(event.parent_event_id)
      if (parentChain) {
        parentChain.events.push(event)
        // If this event starts a new branch, create it
        if (event.child_event_ids?.length) {
          parentChain.branches[event.id] = {
            root_event_id: event.id,
            events: [event],
            branches: {}
          }
        }
      }
    }
  }

  async getEventChainForItem(itemId: string): Promise<EventChain[]> {
    const eventIds = this.itemEvents.get(itemId) || []
    return eventIds
      .map(id => this.findChainForEvent(id))
      .filter((chain): chain is EventChain => chain !== undefined)
  }

  private findChainForEvent(eventId: string): EventChain | undefined {
    // First check if this is a root event
    const rootChain = this.eventChains.get(eventId)
    if (rootChain) return rootChain

    // Otherwise search through all chains
    for (const chain of this.eventChains.values()) {
      const foundChain = this.searchChainForEvent(chain, eventId)
      if (foundChain) return foundChain
    }
  }

  private searchChainForEvent(chain: EventChain, eventId: string): EventChain | undefined {
    // Check if event is in this chain
    if (chain.events.some(e => e.id === eventId)) return chain

    // Search branches
    for (const branch of Object.values(chain.branches)) {
      const found = this.searchChainForEvent(branch, eventId)
      if (found) return found
    }
  }

  // ... other helper methods ...

  // Add method to clear events (useful for testing/cleanup)
  async clearEvents(): Promise<void> {
    this.events.clear()
    this.itemEvents.clear()
    this.eventChains.clear()
    await this.persistEvents()
  }

  // Add method to get all events (useful for debugging)
  getAllEvents(): TrackingEvent[] {
    return Array.from(this.events.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Add debug method
  debug() {
    console.log('Current events:', {
      events: Object.fromEntries(this.events),
      itemEvents: Object.fromEntries(this.itemEvents),
      eventChains: Object.fromEntries(this.eventChains)
    })
  }

  private determineClassifier(category: EventCategory, type: string): EventClassifier {
    if (type.includes('CREATED')) return 'creation'
    if (type.includes('UPDATED')) return 'update'
    if (type.includes('MOVED') || type.includes('LOCATION')) return 'movement'
    if (type.includes('REQUEST')) return 'request'
    if (type.includes('COMPLETED')) return 'completion'
    if (type.includes('SCAN')) return 'scan'
    if (type.includes('ERROR')) return 'error'
    return 'system'
  }
}

// Create and export singleton instance
export const eventTracker = new EventTracker()

// Debug log on initialization
console.log('EventTracker initialized')
eventTracker.debug()