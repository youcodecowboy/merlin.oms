import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Assignment {
  id: string
  timestamp: string
  action: string
  user: string
  details?: string
}

interface AssignmentsLogProps {
  itemId: string
}

export function AssignmentsLog({ itemId }: AssignmentsLogProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAssignments: Assignment[] = [
      {
        id: 'a1',
        timestamp: new Date().toISOString(),
        action: 'Assigned to Production',
        user: 'System',
        details: 'Batch: batch_123'
      }
    ]

    setAssignments(mockAssignments)
    setLoading(false)
  }, [itemId])

  if (loading) {
    return <div className="p-4">Loading assignments...</div>
  }

  if (assignments.length === 0) {
    return <div className="p-4 text-muted-foreground">No assignments found</div>
  }

  return (
    <div className="p-4 space-y-4">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="flex gap-4 text-sm">
          <div className="w-32 flex-shrink-0 text-muted-foreground">
            {format(new Date(assignment.timestamp), 'PP p')}
          </div>
          <div>
            <p>{assignment.action}</p>
            {assignment.details && (
              <p className="text-xs text-muted-foreground">{assignment.details}</p>
            )}
            <p className="text-xs text-muted-foreground">by {assignment.user}</p>
          </div>
        </div>
      ))}
    </div>
  )
}