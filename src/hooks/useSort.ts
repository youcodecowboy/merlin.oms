import { useState, useCallback } from 'react'

interface UseSortOptions {
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
}

export function useSort({
  initialSortBy,
  initialSortOrder = 'asc'
}: UseSortOptions = {}) {
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)

  const onSort = useCallback((key: string) => {
    if (sortBy === key) {
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }, [sortBy])

  return {
    sortBy,
    sortOrder,
    onSort
  }
}