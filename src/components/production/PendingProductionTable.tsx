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
import { AcceptProductionDialog } from './AcceptProductionDialog'
import { getMockPendingProduction } from '@/lib/mock-api/production'
import type { PendingProduction } from '@/lib/schema'

export function PendingProductionTable() {
  const [requests, setRequests] = useState<PendingProduction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PendingProduction | null>(null)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)

  const loadRequests = async () => {
    try {
      setLoading(true)
      console.log('Loading pending production requests...')
      const result = await getMockPendingProduction()
      console.log('Loaded pending production requests:', result)
      setRequests(result)
    } catch (error) {
      console.error('Failed to load pending production:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleAccept = async (batchId: string) => {
    console.log('Production request accepted, batch created:', batchId)
    await loadRequests() // Reload the table
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono">{request.sku}</TableCell>
              <TableCell>{request.quantity}</TableCell>
              <TableCell>
                <Badge variant={
                  request.priority === 'URGENT' ? 'destructive' :
                  request.priority === 'HIGH' ? 'warning' :
                  request.priority === 'LOW' ? 'secondary' :
                  'default'
                }>
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>{request.status}</TableCell>
              <TableCell>
                {request.created_at && new Date(request.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request)
                    setAcceptDialogOpen(true)
                  }}
                >
                  Accept
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedRequest && (
        <AcceptProductionDialog
          request={selectedRequest}
          open={acceptDialogOpen}
          onClose={() => {
            setAcceptDialogOpen(false)
            setSelectedRequest(null)
          }}
          onAccept={handleAccept}
        />
      )}
    </>
  )
}