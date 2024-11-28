import { useState } from 'react'
import { useEvents } from '@/events/hooks'
import { EventType } from '@/events/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  className?: string
}

const EVENT_CATEGORIES = {
  'INVENTORY': ['INVENTORY_CREATED', 'INVENTORY_UPDATED', 'STATUS_CHANGE', 'LOCATION_CHANGE'],
  'ORDER': ['ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_STATUS_CHANGED', 'ORDER_ASSIGNED'],
  'REQUEST': ['REQUEST_CREATED', 'REQUEST_UPDATED', 'REQUEST_COMPLETED', 'REQUEST_FAILED', 'REQUEST_STEPS_UPDATED'],
  'BIN': ['BIN_CREATED', 'BIN_UPDATED', 'BIN_ASSIGNMENT', 'BIN_CAPACITY_CHECK'],
  'QR': ['QR_SCAN', 'QR_ACTIVATION', 'QR_ERROR'],
  'SYSTEM': ['SYSTEM_ERROR', 'DATA_VALIDATION_ERROR', 'STATE_TRANSITION_ERROR']
} as const

export function EventsTable({ className }: Props) {
  const [filters, setFilters] = useState({
    category: 'all',
    eventType: 'all',
    actorId: '',
    search: '',
    dateRange: '24h'
  })

  const events = useEvents()

  const filteredEvents = events.filter(event => {
    if (filters.category !== 'all' && !Object.entries(EVENT_CATEGORIES).find(
      ([category, types]) => category === filters.category && types.includes(event.event_type as any)
    )) return false
    
    if (filters.eventType !== 'all' && event.event_type !== filters.eventType) return false
    if (filters.actorId && event.actor_id !== filters.actorId) return false
    
    if (filters.dateRange) {
      const eventDate = new Date(event.timestamp)
      const now = new Date()
      const hours = {
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30,
        'all': 0
      }[filters.dateRange]
      
      if (hours && eventDate < new Date(now.getTime() - hours * 60 * 60 * 1000)) {
        return false
      }
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const eventString = JSON.stringify(event).toLowerCase()
      if (!eventString.includes(searchTerm)) return false
    }
    
    return true
  })

  const handleExport = () => {
    const headers = ['Timestamp', 'Event Type', 'Actor', 'Details']
    const csvContent = [
      headers.join(','),
      ...filteredEvents.map(event => [
        new Date(event.timestamp).toLocaleString(),
        event.event_type,
        event.actor_id,
        JSON.stringify(event.metadata).replace(/,/g, ';')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `event-log-${new Date().toISOString()}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Select 
          value={filters.category}
          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value, eventType: 'all' }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.keys(EVENT_CATEGORIES).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.eventType}
          onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Types</SelectItem>
            {filters.category !== 'all' && EVENT_CATEGORIES[filters.category as keyof typeof EVENT_CATEGORIES].map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-[300px]"
        />

        <Button 
          variant="outline"
          onClick={handleExport}
          className="ml-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Events Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.event_id}>
                <TableCell>
                  {new Date(event.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{event.event_type}</Badge>
                </TableCell>
                <TableCell>{event.actor_id}</TableCell>
                <TableCell>
                  <pre className="text-xs whitespace-pre-wrap max-w-md">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
            {filteredEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No events found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}