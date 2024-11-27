import { useState, useEffect } from 'react'
import type { WashRequest, LaundryItem } from '../types'

// Mock data moved to hook for better data management
const mockRequests: WashRequest[] = [
  {
    id: "REQ-001",
    status: "Pending",
    items: 5,
    requestedBy: "John Doe",
    requestedAt: "2024-03-27",
    priority: "High"
  },
  {
    id: "REQ-002",
    status: "In Progress",
    items: 3,
    requestedBy: "Jane Smith",
    requestedAt: "2024-03-26",
    priority: "Medium"
  }
]

const mockLaundry: LaundryItem[] = [
  {
    id: "LAU-001",
    status: "In Progress",
    items: 12,
    startedAt: "2024-03-27",
    estimatedCompletion: "2024-03-28",
    type: "Regular Wash"
  },
  {
    id: "LAU-002",
    status: "Completed",
    items: 8,
    startedAt: "2024-03-26",
    estimatedCompletion: "2024-03-27",
    type: "Delicate Wash"
  }
]

export function useWashData() {
  const [requests, setRequests] = useState<WashRequest[]>([])
  const [laundry, setLaundry] = useState<LaundryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true)
        // In the future, replace with actual API calls
        setRequests(mockRequests)
        setLaundry(mockLaundry)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wash data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    requests,
    laundry,
    loading,
    error,
    refresh: () => {
      setLoading(true)
      setRequests(mockRequests)
      setLaundry(mockLaundry)
      setLoading(false)
    }
  }
} 