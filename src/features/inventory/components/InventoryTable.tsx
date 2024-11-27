import { type FC } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useInventory } from '../hooks/useInventory'
import type { InventoryItem, InventoryTableProps } from '../types'

export const InventoryTable: FC<InventoryTableProps> = ({ onItemClick }) => {
  const {
    filteredItems: data,
    loading,
    currentPage,
    setCurrentPage,
    totalPages
  } = useInventory()

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMMITTED':
        return 'success'
      case 'ASSIGNED':
        return 'warning'
      case 'UNCOMMITTED':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return <div>Loading inventory...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Status 1</TableHead>
          <TableHead>Status 2</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Batch ID</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow 
            key={item.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onItemClick(item)}
          >
            <TableCell className="font-mono">{item.sku}</TableCell>
            <TableCell>
              <Badge variant={item.status1 === 'PRODUCTION' ? 'warning' : 'default'}>
                {item.status1}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(item.status2)}>
                {item.status2}
              </Badge>
            </TableCell>
            <TableCell>{item.location || 'Not specified'}</TableCell>
            <TableCell className="font-mono">{item.batch_id || 'N/A'}</TableCell>
            <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 