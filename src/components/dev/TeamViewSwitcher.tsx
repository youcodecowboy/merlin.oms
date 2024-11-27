import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const TEAM_VIEWS = [
  { id: 'ADMIN', label: 'Admin View' },
  { id: 'WAREHOUSE', label: 'Warehouse Team' },
  { id: 'QC', label: 'QC Team' },
  { id: 'FINISHING', label: 'Finishing Team' },
  { id: 'PATTERN', label: 'Pattern Team' }
] as const

type TeamView = typeof TEAM_VIEWS[number]['id']

interface TeamViewSwitcherProps {
  currentView: TeamView
  onViewChange: (view: TeamView) => void
}

export function TeamViewSwitcher({ currentView, onViewChange }: TeamViewSwitcherProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Team View Switcher</h2>
      <div className="space-y-4">
        <div className="max-w-xs">
          <Select value={currentView} onValueChange={onViewChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select team view" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_VIEWS.map((view) => (
                <SelectItem key={view.id} value={view.id}>
                  {view.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            Switch between different team views to test role-specific interfaces
          </p>
        </div>
      </div>
    </Card>
  )
} 