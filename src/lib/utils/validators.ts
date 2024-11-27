import type { Bin } from "@/lib/schema/bins"
import type { DBInventoryItem } from "@/lib/schema/database"

interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateBinAvailability(bins: Bin[]): ValidationResult {
  // Check if there are any bins at all
  if (!bins || bins.length === 0) {
    return {
      valid: false,
      error: "No bins exist in the system. Please create bins before adding inventory items."
    }
  }

  // Check if any bins have available capacity
  const availableBins = bins.filter(bin => bin.current_items < bin.capacity)
  if (availableBins.length === 0) {
    return {
      valid: false,
      error: "All bins are at capacity. Please create new bins before adding inventory items."
    }
  }

  return { valid: true }
}

export function validateInventoryCreation(item: Partial<DBInventoryItem>, bins: Bin[]): ValidationResult {
  // First check bin availability
  const binValidation = validateBinAvailability(bins)
  if (!binValidation.valid) {
    return binValidation
  }

  // Add any additional inventory validation here
  if (!item.current_sku) {
    return {
      valid: false,
      error: "SKU is required"
    }
  }

  return { valid: true }
} 