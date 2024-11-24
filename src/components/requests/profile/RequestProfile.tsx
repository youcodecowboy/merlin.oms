import { useState, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RequestHeader } from "./RequestHeader"
import { RequestInstructions } from "./RequestInstructions"
import { RequestAssignment } from "./RequestAssignment"
import { RequestInventory } from "./RequestInventory"
import { RequestActions } from "./RequestActions"
import { ToDoTimeline } from "./ToDoTimeline"
import { ReportProblemDialog } from "./ReportProblemDialog"
import { EditNotesDialog } from "./EditNotesDialog"
import { ScanBinDialog } from "./ScanBinDialog"
import { cn } from "@/lib/utils"

interface RequestProfileProps {
  requestId: string
}

export function RequestProfile({ requestId }: RequestProfileProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [activeStepId, setActiveStepId] = useState<string | null>(null)

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
    createdAt: new Date(Date.now() - 3600000) // 1 hour ago
  }

  const steps = [
    {
      id: '1',
      title: 'Scan Item QR Code',
      description: 'Find the unit and scan its QR code to begin.',
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 1800000).toISOString(),
      completedBy: 'John Smith',
      action: {
        label: 'Scan QR Code',
        type: 'SCAN_QR',
        onClick: () => {}
      }
    },
    {
      id: '2',
      title: 'Move to Wash Station',
      description: 'Move the unit to the wash station (Bin STA-001).',
      status: 'IN_PROGRESS',
      action: {
        label: 'Scan Bin Location',
        type: 'SCAN_BIN',
        onClick: () => setScanDialogOpen(true)
      }
    },
    {
      id: '3',
      title: 'Complete Wash Process',
      description: 'Follow wash instructions and complete the process.',
      status: 'PENDING',
      action: {
        label: 'Mark as Completed',
        type: 'CONFIRM',
        onClick: () => {}
      }
    }
  ]

  const handleStepComplete = useCallback((stepId: string) => {
    setActiveStepId(stepId)
    const step = steps.find(s => s.id === stepId)
    if (step?.action?.type === 'SCAN_BIN') {
      setScanDialogOpen(true)
    }
  }, [steps])

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <RequestHeader request={request} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <ToDoTimeline 
              steps={steps}
              onStepComplete={handleStepComplete}
            />
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
              onComplete={() => handleStepComplete('3')}
              onReport={() => setReportDialogOpen(true)}
            />
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
        onSuccess={() => {
          if (activeStepId) {
            // Update step status
            console.log('Step completed:', activeStepId)
          }
        }}
      />
    </div>
  )
}