import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import type { Request } from '@/lib/schema'

interface RequestDetailsDialogProps {
  request: Request
  open: boolean
  onClose: () => void
}

export function RequestDetailsDialog({
  request,
  open,
  onClose
}: RequestDetailsDialogProps) {
  // Helper function to safely format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'PPP p')
    } catch (error) {
      console.error('Invalid date:', dateString)
      return 'Invalid date'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Created {formatDate(request.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Request Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge className="ml-2">{request.request_type}</Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  className="ml-2"
                  variant={
                    request.status === 'COMPLETED' ? 'success' :
                    request.status === 'IN_PROGRESS' ? 'warning' :
                    request.status === 'CANCELLED' ? 'destructive' :
                    'default'
                  }
                >
                  {request.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Priority:</span>
                <Badge 
                  className="ml-2"
                  variant={
                    request.priority === 'URGENT' ? 'destructive' :
                    request.priority === 'HIGH' ? 'warning' :
                    request.priority === 'LOW' ? 'secondary' :
                    'default'
                  }
                >
                  {request.priority}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Assignment</h3>
            <div className="space-y-2">
              {request.assigned_to ? (
                <>
                  <div>
                    <span className="text-sm text-muted-foreground">Assigned To:</span>
                    <span className="ml-2 font-medium">{request.assigned_to}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Assigned At:</span>
                    <span className="ml-2">
                      {formatDate(request.assigned_at)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Not yet assigned
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Request History</h3>
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-4">
              {request.events?.map((event, index) => (
                <div key={index} className="flex gap-4 text-sm mb-4">
                  <div className="w-32 flex-shrink-0 text-muted-foreground">
                    {formatDate(event.created_at)}
                  </div>
                  <div>
                    <p>{event.description}</p>
                    {event.user_id && (
                      <p className="text-xs text-muted-foreground">by {event.user_id}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 