import { useState, useEffect } from 'react'
import { PatternRequestsTable } from '@/components/patterns/PatternRequestsTable'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getMockRequests } from '@/lib/mock-api'
import { ProductionProvider } from '@/contexts/ProductionContext'
import type { Request } from '@/lib/schema'

export function Patterns() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      setLoading(true)
      console.log('Loading pattern requests...') // Debug log
      const result = await getMockRequests({
        page: 1,
        pageSize: 100,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })
      console.log('Loaded pattern requests:', result) // Debug log
      setRequests(result.items.filter(item => item.request_type === 'PATTERN_REQUEST'))
    } catch (error) {
      console.error('Failed to load pattern requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  // Load requests only on mount and when manually refreshed
  useEffect(() => {
    loadRequests()

    // Optional: Set up a longer interval (e.g., every minute) to check for updates
    const interval = setInterval(loadRequests, 60000) // 1 minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div>Loading pattern requests...</div>
  }

  return (
    <ProductionProvider>
      <PageLayout
        title="Pattern Requests"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadRequests}>
              Refresh
            </Button>
            <Button onClick={() => console.log('Current requests:', requests)}>
              <Plus className="h-4 w-4 mr-2" />
              New Pattern Request
            </Button>
          </div>
        }
      >
        <PatternRequestsTable
          requests={requests}
          onEdit={(request) => console.log('Edit request:', request)}
        />
      </PageLayout>
    </ProductionProvider>
  )
} 