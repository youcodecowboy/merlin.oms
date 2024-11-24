import type { Order, Request, InventoryItem } from '@/lib/schema'

class APIClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  async getOrders(): Promise<Order[]> {
    return this.fetch<Order[]>(API_ENDPOINTS.ORDERS)
  }

  async getInventory(): Promise<InventoryItem[]> {
    return this.fetch<InventoryItem[]>(API_ENDPOINTS.INVENTORY)
  }

  // Add more type-safe methods...
}

export const apiClient = new APIClient()