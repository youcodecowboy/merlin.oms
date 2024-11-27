import { SKU_WASHES } from './sku'
import { TimelineStage } from '@/lib/schema'

export const DEFAULT_TIMELINE: TimelineStage[] = [
  {
    stage: 'PATTERN',
    status: 'PENDING'
  },
  {
    stage: 'CUTTING',
    status: 'PENDING'
  },
  {
    stage: 'SEWING',
    status: 'PENDING'
  },
  {
    stage: 'WASHING',
    status: 'PENDING'
  },
  {
    stage: 'QC',
    status: 'PENDING'
  },
  {
    stage: 'FINISHING',
    status: 'PENDING'
  },
  {
    stage: 'PACKING',
    status: 'PENDING'
  }
]

export function getCompletedStages(sku: string, isManualInventory: boolean) {
  const stages = []
  
  // For manual inventory, these stages are always complete
  if (isManualInventory) {
    stages.push('PATTERN', 'CUTTING', 'SEWING')
  }

  // Check wash stage
  const washCode = sku.split('-')[4] // Get wash code from SKU
  if (washCode && washCode !== 'RAW' && washCode !== 'BRW') {
    stages.push('WASHING')
  }

  return stages
} 