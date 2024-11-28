import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QCRequestsTable } from '@/components/qc/QCRequestsTable'
import { QCResultsTable } from '@/components/qc/QCResultsTable'
import { mockDB } from '@/lib/mock-db/store'

export function QC() {
  useEffect(() => {
    // Log the current state when the component mounts
    console.log('Current mockDB state:', mockDB)
  }, [])

  return (
    <PageLayout title="Quality Control">
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">QC Requests</TabsTrigger>
          <TabsTrigger value="results">QC Results</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <QCRequestsTable />
        </TabsContent>

        <TabsContent value="results">
          <QCResultsTable />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
} 