import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { permissionActions, permissionResources } from "@/data/mock-auth/types"
import { ROLE_PERMISSIONS, TEAM_PERMISSIONS } from "@/data/mock-auth/permissions"

export function PermissionsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Permissions</h2>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
              <div key={role}>
                <h3 className="font-medium mb-2">{role}</h3>
                <div className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(TEAM_PERMISSIONS).map(([team, permissions]) => (
              <div key={team}>
                <h3 className="font-medium mb-2">{team}</h3>
                <div className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {permissionResources.map((resource) => (
              <div key={resource}>
                <h3 className="font-medium mb-2">{resource}</h3>
                <div className="flex flex-wrap gap-2">
                  {permissionActions.map((action) => (
                    <Badge
                      key={`${action}:${resource}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {action}:{resource}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}