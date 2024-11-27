import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { BinsTable } from '@/components/inventory/BinsTable'
import { CreateInventoryDialog } from '@/components/inventory/CreateInventoryDialog'
import { CreateBinDialog } from '@/components/inventory/CreateBinDialog'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { useToast } from "@/components/ui/use-toast"
import { Plus } from 'lucide-react'
import { mockDB } from '@/lib/mock-db/store'
import { validateBinAvailability } from '@/lib/utils/validators'

export function Inventory() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('items')
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false)
  const [showCreateBinDialog, setShowCreateBinDialog] = useState(false)

  const handleCreateClick = () => {
    if (activeTab === 'items') {
      const validation = validateBinAvailability(mockDB.bins || [])
      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "Cannot Create Item",
          description: validation.error
        })
        return
      }
      setShowCreateItemDialog(true)
    } else {
      setShowCreateBinDialog(true)
    }
  }

  const handleViewBin = (bin: Bin) => {
    navigate(`/bins/${bin.id}`)
  }

  return (
    <PageLayout title="Inventory">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="bins">Bins</TabsTrigger>
          </TabsList>
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'items' ? 'Create Item' : 'Create Bin'}
          </Button>
        </div>

        <TabsContent value="items">
          <InventoryTable 
            data={mockDB.inventory_items}
          />
        </TabsContent>

        <TabsContent value="bins">
          <BinsTable 
            data={mockDB.bins || []}
            onViewBin={handleViewBin}
          />
        </TabsContent>
      </Tabs>

      <CreateInventoryDialog
        open={showCreateItemDialog}
        onOpenChange={setShowCreateItemDialog}
      />

      <CreateBinDialog
        open={showCreateBinDialog}
        onOpenChange={setShowCreateBinDialog}
      />
    </PageLayout>
  )
}