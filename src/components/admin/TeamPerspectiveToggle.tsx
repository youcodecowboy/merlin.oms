import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockTeams } from "@/data/mock-auth/mock-data"

interface TeamPerspectiveToggleProps {
  activeTeam: string | null
  onTeamChange: (teamId: string | null) => void
}

export function TeamPerspectiveToggle({
  activeTeam,
  onTeamChange
}: TeamPerspectiveToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">View as Team:</span>
      <Select
        value={activeTeam || "all"}
        onValueChange={(value) => onTeamChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Teams</SelectItem>
          {mockTeams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}