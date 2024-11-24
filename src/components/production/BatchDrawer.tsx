import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { QRCodeDownload } from "@/components/QRCodeDownload"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { format } from 'date-fns'
import { X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMockBatchDetails, updateMockBatchStatus } from '@/lib/mock-api'
import { useToast } from "@/components/ui/use-toast"
import type { Batch, InventoryItem } from "@/lib/schema"

interface BatchDrawerProps {
  batchId?: string
  open: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function BatchDrawer({ batchId, open, onClose, onUpdate }: BatchDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [batch, setBatch] = useState<Batch & { qr_codes: string[] } | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchBatch() {
      if (!batchId) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await getMockBatchDetails(batchId)
        setBatch(data.batch)
        setItems(data.items)
      } catch (error) {
        console.error('Failed to fetch batch:', error)
        setError('Failed to load batch details')
      } finally {
        setLoading(false)
      }
    }

    if (open && batchId) {
      fetchBatch()
    } else {
      setBatch(null)
      setItems([])
      setError(null)
    }
  }, [batchId, open])

  const handleComplete = async () => {
    if (!batch?.id) return

    try {
      await updateMockBatchStatus(batch.id, 'COMPLETED')
      toast({
        title: "Success",
        description: "Batch marked as completed"
      })
      onUpdate?.()
      onClose()
    } catch (error) {
      console.error('Failed to complete batch:', error)
      toast({
        title: "Error",
        description: "Failed to mark batch as completed",
        variant: "destructive"
      })
    }
  }

  // ... rest of the component remains the same ...
}