import { useParams, useNavigate } from 'react-router-dom'
import { RequestDrawer } from '@/components/requests/RequestDrawer'
import { useEffect, useState } from 'react'
import type { Request } from '@/lib/schema'
import { getMockRequests } from '@/lib/mock-api/requests'

export function RequestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState<Request | null>(null)

  useEffect(() => {
    const loadRequest = async () => {
      if (!id) return
      const requests = await getMockRequests()
      const foundRequest = requests.find(r => r.id === id)
      setRequest(foundRequest || null)
    }
    loadRequest()
  }, [id])

  if (!request) return null

  return (
    <RequestDrawer
      request={request}
      open={true}
      onClose={() => navigate(-1)}
      onInventoryClick={(item) => {
        navigate(`/inventory/${item.id}`)
      }}
    />
  )
} 