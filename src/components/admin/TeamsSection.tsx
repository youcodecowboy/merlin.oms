import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash, Users } from "lucide-react"
import { AddTeamDialog } from "./dialogs/AddTeamDialog"
import { EditTeamDialog } from "./dialogs/EditTeamDialog"
import { DeleteTeamDialog } from "./dialogs/DeleteTeamDialog"
import { mockTeams, mockUsers } from "@/data/mock-auth/mock-data"
import type { Team } from "@/data/mock-auth/types"

export function TeamsSection() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)

  const getTeamMemberCount = (teamId: string) => {
    return mockUsers.filter(user => user.teamId === teamId).length
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teams</h2>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTeams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                {team.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTeam(team)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingTeam(team)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{getTeamMemberCount(team.id)} members</span>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {team.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        variant="secondary"
                        className="text-xs"
                      >
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                {team.description && (
                  <p className="text-sm text-muted-foreground">
                    {team.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddTeamDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <EditTeamDialog
        team={editingTeam}
        open={!!editingTeam}
        onOpenChange={(open) => !open && setEditingTeam(null)}
      />

      <DeleteTeamDialog
        team={deletingTeam}
        open={!!deletingTeam}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
      />
    </div>
  )
}