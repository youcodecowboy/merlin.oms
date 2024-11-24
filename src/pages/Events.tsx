import { useState } from 'react'
import { EventsTable } from '@/components/events/EventsTable'
import { CreateEventDialog } from '@/components/events/CreateEventDialog'
import { PageLayout } from '@/components/PageLayout'

export function Events() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <PageLayout 
      title="Event Log"
      actions={
        <CreateEventDialog onSuccess={handleSuccess} />
      }
    >
      <EventsTable 
        key={refreshTrigger}
      />
    </PageLayout>
  )
}