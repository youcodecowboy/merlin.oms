import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Request } from '@/lib/schema'

interface CuttingBatchEvent {
  timestamp: string
  event: string
  user?: string
}

export interface CuttingBatch {
  id: string
  created_at: string
  patterns: Request[]
  cuttingStatus: 'PICK_UP' | 'CUTTING' | 'ORGANIZING' | 'COMPLETE'
  fabricCode: string
  layers: number
  notes?: string
  assignedTo?: string
  events: CuttingBatchEvent[]
}

interface ProductionContextType {
  cuttingBatches: CuttingBatch[]
  addCuttingBatch: (batch: CuttingBatch) => void
  updateCuttingBatch: (id: string, updates: Partial<CuttingBatch>) => void
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined)

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [cuttingBatches, setCuttingBatches] = useState<CuttingBatch[]>([])

  // Load saved batches from localStorage on mount
  useEffect(() => {
    const savedBatches = localStorage.getItem('cuttingBatches')
    if (savedBatches) {
      try {
        setCuttingBatches(JSON.parse(savedBatches))
      } catch (error) {
        console.error('Failed to load cutting batches:', error)
      }
    }
  }, [])

  // Save batches to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cuttingBatches', JSON.stringify(cuttingBatches))
    } catch (error) {
      console.error('Failed to save cutting batches:', error)
    }
  }, [cuttingBatches])

  const addCuttingBatch = (batch: CuttingBatch) => {
    setCuttingBatches(prev => [...prev, batch])
  }

  const updateCuttingBatch = (id: string, updates: Partial<CuttingBatch>) => {
    setCuttingBatches(prev => 
      prev.map(batch => 
        batch.id === id ? { ...batch, ...updates } : batch
      )
    )
  }

  return (
    <ProductionContext.Provider value={{ 
      cuttingBatches, 
      addCuttingBatch,
      updateCuttingBatch
    }}>
      {children}
    </ProductionContext.Provider>
  )
}

export function useProduction() {
  const context = useContext(ProductionContext)
  if (context === undefined) {
    throw new Error('useProduction must be used within a ProductionProvider')
  }
  return context
} 