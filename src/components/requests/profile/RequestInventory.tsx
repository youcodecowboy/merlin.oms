import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

interface RequestInventoryProps {
  item: any // Replace with proper type
}

export function RequestInventory({ item }: RequestInventoryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Inventory Item</CardTitle>
        <Link to={`/inventory/${item.id}`}>
          <Button variant="outline" size="sm">
            View Item
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono">{item.sku}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Bin: {item.currentBin}
            </div>
          </div>
          <Badge>{item.status}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}