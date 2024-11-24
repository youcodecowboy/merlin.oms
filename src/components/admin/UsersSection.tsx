import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash } from "lucide-react"
import { AddUserDialog } from "./dialogs/AddUserDialog"
import { EditUserDialog } from "./dialogs/EditUserDialog"
import { DeleteUserDialog } from "./dialogs/DeleteUserDialog"
import { mockUsers, mockTeams } from "@/data/mock-auth/mock-data"
import { cn } from "@/lib/utils"
import type { User } from "@/data/mock-auth/types"

interface UsersSectionProps {
  activeTeam: string | null
}

export function UsersSection({ activeTeam }: UsersSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const filteredUsers = activeTeam
    ? mockUsers.filter(user => user.teamId === activeTeam)
    : mockUsers

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const team = mockTeams.find(t => t.id === user.teamId)
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        user.role === 'ADMIN' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                        user.role === 'MANAGER' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        user.role === 'TEAM_LEAD' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {team ? (
                      <Badge variant="outline">{team.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? 'success' : 'secondary'}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingUser(user)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AddUserDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />

      <DeleteUserDialog
        user={deletingUser}
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      />
    </div>
  )
}