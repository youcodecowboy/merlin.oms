import { type FC } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { WashTableProps } from '../types'

export const WashTable: FC<WashTableProps> = ({ 
  data, 
  type,
  onView 
}) => {
  const columns = type === 'requests' 
    ? ['Request ID', 'Status', 'Items', 'Requested By', 'Date', 'Priority']
    : ['Laundry ID', 'Status', 'Items', 'Started', 'Est. Completion', 'Type']

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => (
            <TableHead key={col}>{col}</TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>{item.items}</TableCell>
            {type === 'requests' ? (
              <>
                <TableCell>{(item as any).requestedBy}</TableCell>
                <TableCell>{(item as any).requestedAt}</TableCell>
                <TableCell>{(item as any).priority}</TableCell>
              </>
            ) : (
              <>
                <TableCell>{(item as any).startedAt}</TableCell>
                <TableCell>{(item as any).estimatedCompletion}</TableCell>
                <TableCell>{(item as any).type}</TableCell>
              </>
            )}
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onView(item.id)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 