import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, ChevronLeft, ChevronRight, Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { getMockInventoryItems } from '@/lib/mock-api/inventory'
import { AssignmentsLog } from './AssignmentsLog'
import { EventsLog } from './EventsLog'
import { QRCodeDownload } from './QRCodeDownload'
import type { InventoryItem } from '@/lib/schema'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

const ITEMS_PER_PAGE = 20

interface Filters {
  search: string
  status1: string
  status2: string
  batchId: string
}

// Add these status constants
const STATUS1_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'STOCK', label: 'Stock' }
] as const

const STATUS2_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'COMMITTED', label: 'Committed' },
  { value: 'UNCOMMITTED', label: 'Uncommitted' }
] as const

export function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status1: 'ALL',
    status2: 'ALL',
    batchId: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading inventory items...')
      const result = await getMockInventoryItems()
      console.log('Loaded inventory items:', result)
      setItems(result || [])
      applyFilters(result, filters)
    } catch (error) {
      console.error('Failed to load inventory:', error)
      setItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (items: InventoryItem[], filters: Filters) => {
    let filtered = [...items]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.sku.toLowerCase().includes(searchLower) ||
        item.batch_id?.toLowerCase().includes(searchLower) ||
        item.qr_code?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status1 !== 'ALL') {
      filtered = filtered.filter(item => item.status1 === filters.status1)
    }

    if (filters.status2 !== 'ALL') {
      filtered = filtered.filter(item => item.status2 === filters.status2)
    }

    if (filters.batchId) {
      filtered = filtered.filter(item => item.batch_id === filters.batchId)
    }

    setFilteredItems(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters(items, filters)
  }, [filters, items])

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDetailsOpen(true)
  }

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = filteredItems.slice(startIndex, endIndex)

  if (loading) {
    return <div>Loading inventory...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU, Batch ID, or QR Code"
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
        <div className="w-[150px]">
          <label className="text-sm font-medium mb-2 block">Status 1</label>
          <Select
            value={filters.status1}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status1: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS1_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[150px]">
          <label className="text-sm font-medium mb-2 block">Status 2</label>
          <Select
            value={filters.status2}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status2: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS2_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={loadData}>
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Status 1</TableHead>
            <TableHead>Status 2</TableHead>
            <TableHead>QR Code</TableHead>
            <TableHead>Batch ID</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <TableRow 
                key={item.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleItemClick(item)}
              >
                <TableCell className="font-mono">{item.sku}</TableCell>
                <TableCell>
                  <Badge variant={
                    item.status1 === 'PRODUCTION' ? 'warning' :
                    'default'
                  }>
                    {item.status1}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    item.status2 === 'COMMITTED' ? 'success' :
                    'default'
                  }>
                    {item.status2}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      // QR code download logic here
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download QR
                  </Button>
                </TableCell>
                <TableCell className="font-mono">{item.batch_id || 'N/A'}</TableCell>
                <TableCell>{new Date(item.created_at!).toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No inventory items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Item Details Sheet */}
      {selectedItem && (
        <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <SheetContent side="right" className="w-[80vw] sm:max-w-[80vw] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Inventory Item Details</SheetTitle>
              <SheetDescription>
                Created {format(new Date(selectedItem.created_at!), 'PPP p')}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 grid grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">SKU</p>
                      <p className="font-mono font-medium">{selectedItem.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Batch ID</p>
                      <p className="font-mono font-medium">{selectedItem.batch_id || 'N/A'}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status 1</p>
                        <Badge variant={
                          selectedItem.status1 === 'PRODUCTION' ? 'warning' :
                          'default'
                        }>
                          {selectedItem.status1}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status 2</p>
                        <Badge variant={
                          selectedItem.status2 === 'COMMITTED' ? 'success' :
                          'default'
                        }>
                          {selectedItem.status2}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>QR Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QRCodeDownload qrCode={selectedItem.qr_code!} />
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column - Active Stage */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Stage</CardTitle>
                    <CardDescription>
                      Current status and location information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedItem.status1 === 'PRODUCTION' ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Production Batch</p>
                          <p className="font-mono font-medium">{selectedItem.batch_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Production Stage</p>
                          <Badge>Cutting</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Stage Notes</p>
                          <p className="text-sm">Part of cutting batch XYZ, scheduled for completion on Friday</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Warehouse Location</p>
                          <p className="font-mono font-medium">RACK-A12-SHELF-3</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Stock Status</p>
                          <Badge variant="success">Available</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Inventory Check</p>
                          <p className="text-sm">2024-03-15 09:30 AM</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>
                      Assignment and customer details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedItem.status2 === 'COMMITTED' ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Customer Name</p>
                          <p className="font-medium">John Doe</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Order Number</p>
                          <p className="font-mono">#ORD-12345</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Assigned Date</p>
                          <p className="text-sm">2024-03-15</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        Not assigned to a customer
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - History */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignments History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <AssignmentsLog itemId={selectedItem.id!} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Events History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <EventsLog itemId={selectedItem.id!} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}