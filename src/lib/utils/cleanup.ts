import { toast } from "@/components/ui/use-toast"

export async function cleanupMockData() {
  try {
    // Clear all mock data from localStorage
    const keysToClean = [
      'mockInventoryItems',
      'mockOrders',
      'mockRequests',
      'notifications-storage',
      'mockEvents',
      'pendingProductionRequests',
      'production-batches',
      'waitlistEntries',
      'tracking-events'
    ]

    keysToClean.forEach(key => {
      console.log(`Clearing storage key: ${key}`)
      localStorage.removeItem(key)
    })

    // Reload the page to reset all in-memory state
    window.location.reload()

    toast({
      title: "Data Cleared",
      description: "All mock data has been cleared successfully"
    })
  } catch (error) {
    console.error('Failed to clear data:', error)
    toast({
      title: "Error",
      description: "Failed to clear mock data",
      variant: "destructive"
    })
  }
} 