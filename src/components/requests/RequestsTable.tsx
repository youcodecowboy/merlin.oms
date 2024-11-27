import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockDB } from '@/lib/mock-db/store'
import type { DBRequest } from '@/lib/schema/database'

interface RequestsTableProps {
  onRequestClick?: (request: DBRequest) => void
}

export function RequestsTable({ onRequestClick }: RequestsTableProps) {
  const [requests, setRequests] = useState<DBRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      setLoading(true)
      setRequests(mockDB.requests)
    } catch (error) {
      console.error('Failed to load requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-mono">{request.id}</TableCell>
            <TableCell>
              <Badge variant="outline">{request.request_type}</Badge>
            </TableCell>
            <TableCell>
              <Badge>{request.status}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={
                request.priority === 'HIGH' ? 'destructive' :
                request.priority === 'MEDIUM' ? 'default' :
                'secondary'
              }>
                {request.priority}
              </Badge>
            </TableCell>
            <TableCell>{new Date(request.created_at).toLocaleString()}</TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRequestClick?.(request)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              No requests found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}