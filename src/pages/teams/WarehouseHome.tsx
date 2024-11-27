import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMockRequests } from '@/lib/mock-api/requests'
import type { Request } from '@/lib/schema'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Box, ArrowRight } from 'lucide-react'

export function WarehouseHome() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const allRequests = await getMockRequests()
        setRequests(allRequests.filter(r => 
          (r.request_type === 'WASH_REQUEST' || r.request_type === 'MOVE_REQUEST') &&
          r.status !== 'COMPLETED'
        ))
      } catch (error) {
        console.error('Failed to load requests:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const washRequests = requests.filter(r => r.request_type === 'WASH_REQUEST')
  const moveRequests = requests.filter(r => r.request_type === 'MOVE_REQUEST')

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warehouse Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/inv')}>
            <Box className="h-4 w-4 mr-2" />
            Inventory
          </Button>
        </div>
      </div>

      <Tabs defaultValue="wash" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wash">
            Wash Requests ({washRequests.length})
          </TabsTrigger>
          <TabsTrigger value="move">
            Move Requests ({moveRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wash">
          <div className="grid gap-4">
            {washRequests.map((request) => (
              <Card key={request.id} className="hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Wash Request #{request.id}
                  </CardTitle>
                  <Badge>{request.priority}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {request.inventory_item?.sku}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Created {new Date(request.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/requests/${request.id}`)}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {washRequests.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No wash requests pending
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="move">
          <div className="grid gap-4">
            {moveRequests.map((request) => (
              <Card key={request.id} className="hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Move Request #{request.id}
                  </CardTitle>
                  <Badge>{request.priority}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {request.inventory_item?.sku}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Created {new Date(request.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/requests/${request.id}`)}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {moveRequests.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No move requests pending
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 