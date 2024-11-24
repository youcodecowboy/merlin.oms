import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCommitmentsStore } from '@/lib/stores/commitmentsStore'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { cn } from "@/lib/utils"

export function CommitmentsLog() {
  const [search, setSearch] = useState('')
  const commitments = useCommitmentsStore(state => state.commitments)

  const filteredCommitments = commitments.filter(commitment => 
    search === '' ||
    commitment.sku.toLowerCase().includes(search.toLowerCase()) ||
    commitment.universalSku.toLowerCase().includes(search.toLowerCase()) ||
    commitment.orderNumber.toString().includes(search)
  )

  // Group commitments by SKU
  const groupedCommitments = filteredCommitments.reduce((groups, commitment) => {
    const key = commitment.universalSku
    if (!groups[key]) {
      groups[key] = {
        sku: commitment.sku,
        universalSku: commitment.universalSku,
        totalQuantity: 0,
        commitments: []
      }
    }
    groups[key].totalQuantity += commitment.quantity
    groups[key].commitments.push(commitment)
    return groups
  }, {} as Record<string, {
    sku: string
    universalSku: string
    totalQuantity: number
    commitments: typeof commitments
  }>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Commitments Log</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search commitments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.values(groupedCommitments).map(group => (
            <div
              key={group.universalSku}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{group.universalSku}</span>
                    <Badge variant="outline">
                      Total: {group.totalQuantity} units
                    </Badge>
                  </div>
                  {group.sku !== group.universalSku && (
                    <div className="text-sm text-muted-foreground">
                      Original SKU: {group.sku}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {group.commitments.map(commitment => (
                  <div
                    key={commitment.id}
                    className="p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          Order #{commitment.orderNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {commitment.quantity} units
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(commitment.createdAt), 'PPp')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredCommitments.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No commitments found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}