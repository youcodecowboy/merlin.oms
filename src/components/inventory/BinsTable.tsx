import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Package,
  QrCode
} from "lucide-react"
import type { Bin } from '@/lib/schema/bins'

interface BinsTableProps {
  data: Bin[]
  onViewBin?: (bin: Bin) => void
  onViewQR?: (bin: Bin) => void
}

export function BinsTable({ data, onViewBin, onViewQR }: BinsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bin ID</TableHead>
          <TableHead>Zone</TableHead>
          <TableHead>Rack</TableHead>
          <TableHead>Shelf</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((bin) => (
          <TableRow 
            key={bin.id}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-mono">{bin.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onViewQR?.(bin)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{bin.zone}</Badge>
            </TableCell>
            <TableCell>{bin.rack}</TableCell>
            <TableCell>{bin.shelf}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>{bin.current_items} / {bin.capacity}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getBinStatusVariant(bin)}>
                {getBinStatus(bin)}
              </Badge>
            </TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewBin?.(bin)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Bin
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              No bins found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function getBinStatus(bin: Bin): string {
  const usage = (bin.current_items / bin.capacity) * 100
  if (usage >= 90) return 'FULL'
  if (usage >= 70) return 'NEAR FULL'
  if (usage > 0) return 'IN USE'
  return 'EMPTY'
}

function getBinStatusVariant(bin: Bin): "default" | "secondary" | "destructive" | "outline" {
  const usage = (bin.current_items / bin.capacity) * 100
  if (usage >= 90) return 'destructive'
  if (usage >= 70) return 'secondary'
  if (usage > 0) return 'default'
  return 'outline'
} 