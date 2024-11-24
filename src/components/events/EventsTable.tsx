import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { DataTable, type Column } from '@/components/tables/DataTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSort } from '@/hooks/useSort'
import { usePagination } from '@/hooks/usePagination'
import { cn } from "@/lib/utils"
import { getMockEvents } from '@/lib/mock-api'
import { eventStatus, eventPriority } from '@/lib/schema'
import type { Event } from '@/lib/schema'

export function EventsTable() {
  const [items, setItems] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    team: '',
    status: '',
    priority: '',
    assignedTo: '',
    startDate: '',
    endDate: ''
  })
  const { page, pageSize, onPageChange } = usePagination()
  const { sortBy, sortOrder, onSort } = useSort({
    initialSortBy: 'created_at',
    initialSortOrder: 'desc'
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await getMockEvents({
        page,
        pageSize,
        sortBy,
        sortOrder,
        ...filters
      })
      setItems(result.items)
      setTotal(result.total)
    } catch (error) {
      console.error('Failed to load events:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, sortBy, sortOrder])

  const columns: Column<Event>[] = [
    {
      key: 'event_name',
      header: 'Event',
      cell: (item) => (
        <div>
          <div className="font-medium">{item.event_name}</div>
          {item.event_description && (
            <div className="text-sm text-muted-foreground">
              {item.event_description}
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'assigned_to',
      header: 'Assigned To',
      cell: (item) => (
        <div>
          <div>{item.assigned_to}</div>
          <div className="text-sm text-muted-foreground">{item.team}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => (
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          {
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': 
              item.status === 'PENDING',
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': 
              item.status === 'IN_PROGRESS',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': 
              item.status === 'COMPLETED',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': 
              item.status === 'OVERDUE'
          }
        )}>
          {item.status}
        </span>
      ),
      sortable: true
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (item) => (
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          {
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': 
              item.priority === 'URGENT',
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': 
              item.priority === 'HIGH',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': 
              item.priority === 'MEDIUM',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': 
              item.priority === 'LOW'
          }
        )}>
          {item.priority}
        </span>
      ),
      sortable: true
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (item) => format(new Date(item.created_at), 'PPp'),
      sortable: true
    },
    {
      key: 'completed_at',
      header: 'Completed',
      cell: (item) => item.completed_at ? format(new Date(item.completed_at), 'PPp') : '-',
      sortable: true
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {eventStatus.map(status => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            {eventPriority.map(priority => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Filter by team..."
          value={filters.team}
          onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
        />

        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
        />

        <Button onClick={loadData}>
          Apply Filters
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onPageChange={onPageChange}
        emptyMessage="No events found."
      />
    </div>
  )
}