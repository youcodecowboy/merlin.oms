import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ProductionBatch } from '@/lib/schema'

interface ProductionContextType {
  productionBatches: ProductionBatch[]
  refreshBatches: () => Promise<void>
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined)

const PRODUCTION_BATCHES_KEY = 'production-batches'

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([])

  const loadBatches = async () => {
    const saved = localStorage.getItem(PRODUCTION_BATCHES_KEY)
    setProductionBatches(saved ? JSON.parse(saved) : [])
  }

  useEffect(() => {
    loadBatches()
  }, [])

  const refreshBatches = async () => {
    await loadBatches()
  }

  return (
    <ProductionContext.Provider value={{ productionBatches, refreshBatches }}>
      {children}
    </ProductionContext.Provider>
  )
}

export const useProduction = () => {
  const context = useContext(ProductionContext)
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider')
  }
  return context
} 