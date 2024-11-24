import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/hooks/usePermissions"
import { UsersSection } from "@/components/admin/UsersSection"
import { TeamsSection } from "@/components/admin/TeamsSection"
import { PermissionsSection } from "@/components/admin/PermissionsSection"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { TeamPerspectiveToggle } from "@/components/admin/TeamPerspectiveToggle"

export function AdminPanel() {
  const { isAdmin } = usePermissions()
  const [activeTeam, setActiveTeam] = useState<string | null>(null)

  if (!isAdmin) {
    return (
      <div className="container mx-auto mt-8">
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access the admin panel.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <TeamPerspectiveToggle
          activeTeam={activeTeam}
          onTeamChange={setActiveTeam}
        />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersSection activeTeam={activeTeam} />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsSection />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsSection />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}