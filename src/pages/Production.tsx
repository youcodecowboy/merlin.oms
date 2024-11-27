import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingProductionTable } from '@/components/production/PendingProductionTable'
import { BatchesTable } from '@/components/production/BatchesTable'
import { PageLayout } from '@/components/PageLayout'
import { ProductionProvider } from '@/contexts/ProductionContext'

export function Production() {
  return (
    <ProductionProvider>
      <PageLayout title="Production">
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="batches">Production Batches</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingProductionTable />
          </TabsContent>
          <TabsContent value="batches">
            <BatchesTable />
          </TabsContent>
        </Tabs>
      </PageLayout>
    </ProductionProvider>
  )
}