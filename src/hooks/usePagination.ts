import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage)
  const [pageSize] = useState(initialPageSize)

  const onPageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  return {
    page,
    pageSize,
    onPageChange
  }
}