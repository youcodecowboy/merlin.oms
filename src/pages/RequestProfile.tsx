import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RequestHeader } from "@/components/requests/profile/RequestHeader"
import { RequestInstructions } from "@/components/requests/profile/RequestInstructions"
import { RequestAssignment } from "@/components/requests/profile/RequestAssignment"
import { RequestInventory } from "@/components/requests/profile/RequestInventory"
import { RequestActions } from "@/components/requests/profile/RequestActions"
import { RequestTimeline } from "@/components/requests/profile/RequestTimeline"
import { ReportProblemDialog } from "@/components/requests/profile/ReportProblemDialog"
import { EditNotesDialog } from "@/components/requests/profile/EditNotesDialog"
import { ScanBinDialog } from "@/components/requests/profile/ScanBinDialog"

interface RequestProfileProps {
  requestId: string
}

export function RequestProfile({ requestId }: RequestProfileProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [scanDialogOpen, setScanDialogOpen] = useState(false)

  // Mock data - in real app, fetch this from your API
  const request = {
    id: requestId,
    type: 'WASH_REQUEST',
    title: 'Wash Request',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7200000), // 2 hours from now
    instructions: 'Move unit to Bin STA and scan the bin to confirm the action.',
    assignedTo: {
      id: '1',
      name: 'John Smith',
      avatar: 'https://github.com/shadcn.png'
    },
    inventoryItem: {
      id: '1',
      sku: 'ST-32-S-32-RAW',
      currentBin: 'BIN-123',
      status: 'WASH'
    },
    notes: 'Handle with care - special wash instructions apply',
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    timeline: [
      {
        id: '1',
        type: 'CREATED',
        description: 'Request created',
        timestamp: new Date(Date.now() - 3600000),
        user: 'System'
      },
      {
        id: '2',
        type: 'ASSIGNED',
        description: 'Assigned to John Smith',
        timestamp: new Date(Date.now() - 3000000),
        user: 'Jane Doe'
      }
    ]
  }

  const handleComplete = async () => {
    if (request.type === 'WASH_REQUEST') {
      setScanDialogOpen(true)
    } else {
      // Handle other request types
      console.log('Completing request:', requestId)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <RequestHeader request={request} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <RequestInstructions 
              request={request}
              onEditNotes={() => setNotesDialogOpen(true)}
            />
            <RequestAssignment request={request} />
            <RequestInventory item={request.inventoryItem} />
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-6">
            <RequestActions
              request={request}
              onComplete={handleComplete}
              onReport={() => setReportDialogOpen(true)}
            />
            <RequestTimeline events={request.timeline} />
          </div>
        </div>
      </div>

      <ReportProblemDialog
        requestId={requestId}
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />

      <EditNotesDialog
        request={request}
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
      />

      <ScanBinDialog
        requestId={requestId}
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
      />
    </div>
  )
}