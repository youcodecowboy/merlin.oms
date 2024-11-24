import { useState } from 'react'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { ShopifyIcon } from '@/components/icons/ShopifyIcon'
import { getMockOrders } from '@/lib/mock-api'
import { useEffect } from 'react'
import type { Order } from '@/lib/schema'

export function Orders() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getMockOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [refreshTrigger])

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <PageLayout 
      title="Orders"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ShopifyIcon className="h-4 w-4 mr-2" />
            Sync Shopify
          </Button>
          <CreateOrderDialog onSuccess={handleSuccess} />
        </div>
      }
    >
      <OrdersTable 
        key={refreshTrigger}
        orders={orders}
      />
    </PageLayout>
  )
}