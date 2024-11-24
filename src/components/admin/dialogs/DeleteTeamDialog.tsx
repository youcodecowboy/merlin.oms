import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import type { Team } from "@/data/mock-auth/types"

interface DeleteTeamDialogProps {
  team: Team | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteTeamDialog({
  team,
  open,
  onOpenChange,
  onSuccess
}: DeleteTeamDialogProps) {
  const { execute: handleDelete, loading } = useAsyncAction(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Deleting team:', team?.id)
    onOpenChange(false)
    onSuccess?.()
  }, {
    successMessage: "Team deleted successfully"
  })

  if (!team) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {team.name}? This will unassign all team members and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete()}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}