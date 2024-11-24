import { useState } from 'react'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'

export default function OrdersPage() {
  const { orders, loading, refresh } = useOrders()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  if (loading) {
    return <div>Loading orders...</div>
  }

  return (
    <PageLayout title="Orders">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Shopify
            </Button>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        <OrdersTable orders={orders} />

        <CreateOrderDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={() => {
            setCreateDialogOpen(false)
            refresh()
          }}
        />
      </div>
    </PageLayout>
  )
}

export { OrdersPage } 