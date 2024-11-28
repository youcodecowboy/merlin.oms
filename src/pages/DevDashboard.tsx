import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  createInventoryItem, 
  createTestWashRequest, 
  createHanSoloOrder, 
  createRandomOrder,
  createRandomInventoryItem,
  createTestQCRequest,
  resetMockData
} from "@/lib/mock-db/store"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"
import { Trash2, Package, Loader2, User, Shuffle, Plus, ShieldCheck } from "lucide-react"

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

  const handleCreateRandomInventoryItem = () => {
    try {
      const item = createRandomInventoryItem()
      toast({
        title: "Inventory Item Created",
        description: `Created item ${item.id} with SKU ${item.current_sku}`,
      })
      navigate('/inv')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create inventory item"
      })
    }
  }

  const handleCreateRandomOrder = () => {
    try {
      const { order, customer, matchedItem } = createRandomOrder()
      toast({
        title: "Random Order Created",
        description: `Created order ${order.number} for ${customer.name} (${matchedItem ? 'Matched to inventory' : 'Production needed'})`,
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

  const handleCreateTestQCRequest = () => {
    try {
      const request = createTestQCRequest()
      toast({
        title: "QC Request Created",
        description: `Created QC request for item ${request.item_id}`,
      })
      navigate('/qc')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create QC request"
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
      // Refresh the page to show clean state
      window.location.reload()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clean up data"
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
              <div className="space-y-2">
                <Button 
                  onClick={handleCreateInventoryItem}
                  className="w-full gap-2"
                >
                  <Package className="h-4 w-4" />
                  Create Inventory Item
                </Button>
                <Button 
                  onClick={handleCreateRandomInventoryItem}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Random Inventory Item
                </Button>
              </div>
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

            <div>
              <h3 className="font-medium mb-2">QC Requests</h3>
              <Button 
                onClick={handleCreateTestQCRequest}
                className="w-full gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Create Test QC Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 