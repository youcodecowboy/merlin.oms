// Generate a unique 5-character alphanumeric ID
export function generateInventoryId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let id = 'I'  // Start with I for Inventory
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

// Validate if an ID already exists in the store
export function isUniqueId(id: string, existingIds: string[]): boolean {
  return !existingIds.includes(id)
}

// Generate a guaranteed unique ID
export function generateUniqueInventoryId(existingIds: string[]): string {
  let id = generateInventoryId()
  while (!isUniqueId(id, existingIds)) {
    id = generateInventoryId()
  }
  return id
}

/**
 * Generates a unique bin ID in the format: XXX-CAP-ZONE-SHELF-RACK
 * Example: 123-025-STA-1-A
 */
export function generateUniqueBinId(
  capacity: number,
  zone: string,
  shelf: string,
  rack: string
): string {
  // Generate a random 3-digit number
  const uniqueNum = Math.floor(Math.random() * 900) + 100
  
  // Pad capacity to 3 digits
  const paddedCapacity = capacity.toString().padStart(3, '0')
  
  // Format: 123-025-STA-1-A
  return `${uniqueNum}-${paddedCapacity}-${zone}-${shelf}-${rack}`
} 