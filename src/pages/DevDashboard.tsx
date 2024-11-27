import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createInventoryItem, createTestWashRequest, createHanSoloOrder, createRandomOrder, resetMockData } from "@/lib/mock-db/store"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"
import { Trash2, Package, Loader2, User, Shuffle } from "lucide-react"

export function DevDashboard() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleCreateInventoryItem = () => {
    try {
      const newItem = createInventoryItem()
      toast({
        title: "Inventory Item Created",
        description: `Created item with ID: ${newItem.id}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create inventory item"
      })
    }
  }

  const handleCreateTestWashRequest = () => {
    try {
      const { item, request } = createTestWashRequest()
      toast({
        title: "Test Wash Request Created",
        description: `Created wash request for item ${item.id}`,
      })
      navigate('/wash')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create test wash request"
      })
    }
  }

  const handleCreateHanSoloOrder = () => {
    try {
      const { customer, order, item } = createHanSoloOrder()
      toast({
        title: "Han Solo's Order Created",
        description: `Created order ${order.number} with item ${item.id}`,
      })
      navigate('/orders')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create Han Solo's order"
      })
    }
  }

  const handleCreateRandomOrder = () => {
    try {
      const { customer, order, item } = createRandomOrder()
      toast({
        title: "Random Order Created",
        description: `Created order ${order.number} for ${customer.name}`,
      })
      navigate('/orders')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create random order"
      })
    }
  }

  const handleCleanup = () => {
    try {
      resetMockData()
      toast({
        title: "Data Cleaned Up",
        description: "All mock data has been reset to initial state"
      })
      // Optionally refresh the current page
      window.location.reload()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clean up mock data"
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dev Dashboard</h1>
        <Button 
          variant="destructive" 
          onClick={handleCleanup}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clean Up All Data
        </Button>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Data Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Inventory Items</h3>
              <Button 
                onClick={handleCreateInventoryItem}
                className="w-full gap-2"
              >
                <Package className="h-4 w-4" />
                Create Inventory Item
              </Button>
            </div>

            <div>
              <h3 className="font-medium mb-2">Orders</h3>
              <div className="space-y-2">
                <Button 
                  onClick={handleCreateHanSoloOrder}
                  className="w-full gap-2"
                >
                  <User className="h-4 w-4" />
                  Create Han Solo's Order
                </Button>
                <Button 
                  onClick={handleCreateRandomOrder}
                  className="w-full gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Create Random Order
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Wash Requests</h3>
              <Button 
                onClick={handleCreateTestWashRequest}
                className="w-full gap-2"
              >
                <Loader2 className="h-4 w-4" />
                Create Test Wash Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 