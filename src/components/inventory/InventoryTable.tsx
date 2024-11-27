import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { InventoryItemLink } from './InventoryItemLink'
import type { DBInventoryItem } from '@/lib/schema/database'

interface InventoryTableProps {
  data?: DBInventoryItem[]
  loading?: boolean
}

export function InventoryTable({ data = [], loading }: InventoryTableProps) {
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item ID</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <InventoryItemLink item={item} className="font-mono hover:underline" />
            </TableCell>
            <TableCell>{item.current_sku}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Badge>{item.status1}</Badge>
                <Badge variant="outline">{item.status2}</Badge>
              </div>
            </TableCell>
            <TableCell>{item.location || 'Not specified'}</TableCell>
            <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No inventory items found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}