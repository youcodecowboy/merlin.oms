import { PageLayout } from '@/components/PageLayout'
import { EventsTable } from '@/components/events/EventsTable'

export function Events() {
  return (
    <PageLayout 
      title="Event Log"
      description="View and export system events and activity logs"
    >
      <div className="space-y-4">
        <EventsTable />
      </div>
    </PageLayout>
  )
}