import { type FC } from 'react'
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InventoryFilter } from '../types'

interface Props {
  filters: InventoryFilter
  onFilterChange: (filters: InventoryFilter) => void
}

export const InventoryFilters: FC<Props> = ({
  filters,
  onFilterChange
}) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-8"
        />
      </div>
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.location}
        onValueChange={(value) => onFilterChange({ ...filters, location: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="warehouse">Warehouse</SelectItem>
          <SelectItem value="store">Store</SelectItem>
          <SelectItem value="production">Production</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 