import { useState, useEffect, useCallback } from 'react'
import type { InventoryItem, InventoryFilters } from '../types'
import { getMockInventoryItems } from '@/lib/mock-api/inventory'
import { useToast } from '@/components/ui/use-toast'

const ITEMS_PER_PAGE = 20

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    status1: 'ALL',
    status2: 'ALL',
    batchId: ''
  })

  const { toast } = useToast()

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getMockInventoryItems()
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch inventory data"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const filtered = items.filter(item => {
      if (filters.status1 !== 'ALL' && item.status1 !== filters.status1) return false
      if (filters.status2 !== 'ALL' && item.status2 !== filters.status2) return false
      if (filters.batchId && item.batch_id !== filters.batchId) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          item.sku.toLowerCase().includes(searchLower) ||
          item.batch_id?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    setFilteredItems(filtered)
  }, [items, filters])

  const updateFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  return {
    items,
    filteredItems,
    loading,
    error,
    filters,
    updateFilters,
    refresh: fetchInventory,
    currentPage,
    setCurrentPage,
    totalPages
  }
} 