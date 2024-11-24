import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingProductionTable } from '@/components/production/PendingProductionTable'
import { ProductionBatchesTable } from '@/components/production/ProductionBatchesTable'
import { AddProductionRequestDialog } from '@/components/production/AddProductionRequestDialog'
import { PageLayout } from '@/components/PageLayout'
import { ProductionProvider } from '@/contexts/ProductionContext'

export function Production() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <ProductionProvider>
      <PageLayout 
        title="Production"
        actions={
          <AddProductionRequestDialog onSuccess={handleSuccess} />
        }
      >
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="batches">Production Batches</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <PendingProductionTable 
              key={refreshTrigger}
            />
          </TabsContent>
          <TabsContent value="batches">
            <ProductionBatchesTable />
          </TabsContent>
        </Tabs>
      </PageLayout>
    </ProductionProvider>
  )
}