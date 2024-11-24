import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAsyncAction } from "@/hooks/useAsyncAction"

export function SettingsSection() {
  const { execute: handleClearCache, loading: clearingCache } = useAsyncAction(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Cache cleared')
  }, {
    successMessage: "Cache cleared successfully"
  })

  const { execute: handleSyncPermissions, loading: syncingPermissions } = useAsyncAction(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Permissions synced')
  }, {
    successMessage: "Permissions synced successfully"
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cache Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline"
            onClick={() => handleClearCache()}
            disabled={clearingCache}
          >
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      {/* Permission Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permission Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => handleSyncPermissions()}
            disabled={syncingPermissions}
          >
            Sync Permissions
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}