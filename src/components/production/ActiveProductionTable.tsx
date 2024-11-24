import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSort } from '@/hooks/useSort'
import { usePagination } from '@/hooks/usePagination'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { cn } from "@/lib/utils"
import { 
  getMockActiveProduction, 
  moveToNextMockStage,
  deleteMockProductionItem,
  updateMockProductionItem 
} from '@/lib/mock-api/production'
import { MoreHorizontal, Trash, Pencil } from "lucide-react"
import { EditProductionItemDialog } from './EditProductionItemDialog'
import type { ProductionRequest } from '@/lib/schema'

export function ActiveProductionTable() {
  const [items, setItems] = useState<ProductionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [editingItem, setEditingItem] = useState<ProductionRequest | null>(null)
  const { page, pageSize, onPageChange } = usePagination()
  const { sortBy, sortOrder, onSort } = useSort({
    initialSortBy: 'updated_at',
    initialSortOrder: 'desc'
  })

  const { execute: handleMoveNext } = useAsyncAction(async (id: string) => {
    const nextStage = await moveToNextMockStage(id)
    await loadData()
    return nextStage
  }, {
    successMessage: "Item moved to next stage successfully"
  })

  const { execute: handleDelete } = useAsyncAction(async (id: string) => {
    await deleteMockProductionItem(id)
    await loadData()
  }, {
    successMessage: "Production item deleted successfully"
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getMockActiveProduction()
      setItems(data || []) // Ensure we always have an array
      setTotal(data?.length || 0)
    } catch (error) {
      console.error('Failed to load active production:', error)
      setItems([]) // Set empty array on error
      setTotal(0)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData()
  }, [page, sortBy, sortOrder])

  // Add polling to keep data fresh
  useEffect(() => {
    const interval = setInterval(loadData, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const columns: Column<ProductionRequest>[] = [
    {
      key: 'sku',
      header: 'SKU',
      cell: (item) => (
        <span className="font-mono">{item.sku}</span>
      ),
      sortable: true
    },
    {
      key: 'current_stage',
      header: 'Stage',
      cell: (item) => (
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          {
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': item.current_stage === 'CUTTING',
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': item.current_stage === 'SEWING',
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': item.current_stage === 'WASHING',
            'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200': item.current_stage === 'FINISHING',
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': item.current_stage === 'QC',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': item.current_stage === 'READY'
          }
        )}>
          {item.current_stage}
        </span>
      ),
      sortable: true
    },
    {
      key: 'notes',
      header: 'Notes',
      cell: (item) => item.notes || '-'
    },
    {
      key: 'updated_at',
      header: 'Last Updated',
      cell: (item) => format(new Date(item.updated_at!), 'PPp'),
      sortable: true
    },
    {
      key: 'actions',
      header: '',
      cell: (item) => (
        <div className="flex items-center gap-2">
          {item.current_stage !== 'READY' && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleMoveNext(item.id!)
              }}
            >
              Move to Next Stage
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingItem(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(item.id!)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onPageChange={onPageChange}
        emptyMessage="No active production items found."
      />

      <EditProductionItemDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSuccess={loadData}
      />
    </>
  )
}