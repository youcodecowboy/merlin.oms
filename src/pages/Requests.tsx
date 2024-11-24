import { useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { RequestsTable } from '@/components/requests/RequestsTable'
import { RequestsProvider } from '@/contexts/RequestsContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Requests() {
  return (
    <RequestsProvider>
      <PageLayout title="Requests">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="stock">Stock Requests</TabsTrigger>
            <TabsTrigger value="wash">Wash Requests</TabsTrigger>
            <TabsTrigger value="move">Move Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <RequestsTable type="all" />
          </TabsContent>
          <TabsContent value="stock">
            <RequestsTable type="STOCK_PULL" />
          </TabsContent>
          <TabsContent value="wash">
            <RequestsTable type="WASH_TRANSFER" />
          </TabsContent>
          <TabsContent value="move">
            <RequestsTable type="MOVE_REQUEST" />
          </TabsContent>
        </Tabs>
      </PageLayout>
    </RequestsProvider>
  )
}