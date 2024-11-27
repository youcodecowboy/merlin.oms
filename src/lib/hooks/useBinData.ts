import { useState, useEffect } from 'react'
import { mockDB } from '@/lib/mock-db/store'
import type { Bin } from '@/lib/schema/bins'
import type { DBInventoryItem } from '@/lib/schema/database'

interface UseBinDataReturn {
  bin: Bin | null
  items: DBInventoryItem[]
  loading: boolean
  error: string | null
}

export function useBinData(binId: string | undefined): UseBinDataReturn {
  const [bin, setBin] = useState<Bin | null>(null)
  const [items, setItems] = useState<DBInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!binId) return

      try {
        setLoading(true)
        setError(null)

        // Find bin
        const foundBin = mockDB.bins?.find(b => b.id === binId)
        if (!foundBin) {
          throw new Error('Bin not found')
        }
        setBin(foundBin)

        // Get items in bin
        const binItems = mockDB.inventory_items.filter(item => 
          foundBin.items.includes(item.id)
        )
        setItems(binItems)

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load bin data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [binId])

  return {
    bin,
    items,
    loading,
    error
  }
} 