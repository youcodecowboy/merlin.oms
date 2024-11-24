export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  status1?: string
  status2?: string
  request_type?: string
}

export interface ApiResponse<T> {
  items: T[]
  total: number
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
} 