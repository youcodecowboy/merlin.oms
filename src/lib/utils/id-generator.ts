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

export function generateUniqueBinId(
  capacity: number,
  zone: string,
  shelf: string,
  rack: string
): string {
  // Generate a unique 3-digit number
  const uniqueNum = Math.floor(Math.random() * 900) + 100
  
  // Format: 123-100-1-1-A
  return `${uniqueNum}-${capacity}-${zone}-${shelf}-${rack}`
} 