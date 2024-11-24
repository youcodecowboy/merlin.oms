import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface RequestAssignmentProps {
  request: any // Replace with proper type
}

export function RequestAssignment({ request }: RequestAssignmentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={request.assignedTo.avatar} />
            <AvatarFallback>
              {request.assignedTo.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{request.assignedTo.name}</p>
            <p className="text-sm text-muted-foreground">Assigned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}