import { useState, useEffect } from 'react'
import { PatternRequestsTable } from '@/components/patterns/PatternRequestsTable'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getMockRequests } from '@/lib/mock-api'
import type { Request } from '@/lib/schema'

export default function PatternRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      setLoading(true)
      const result = await getMockRequests({
        page: 1,
        pageSize: 100,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })
      setRequests(result.items.filter(item => item.request_type === 'PATTERN_REQUEST'))
    } catch (error) {
      console.error('Failed to load pattern requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleCreateRequest = () => {
    // TODO: Implement create pattern request
  }

  const handleEditRequest = (request: Request) => {
    // TODO: Implement edit pattern request
  }

  return (
    <PageLayout
      title="Pattern Requests"
      actions={
        <Button onClick={handleCreateRequest}>
          <Plus className="h-4 w-4 mr-2" />
          New Pattern Request
        </Button>
      }
    >
      <PatternRequestsTable
        requests={requests}
        onEdit={handleEditRequest}
      />
    </PageLayout>
  )
}

export { PatternRequests } 