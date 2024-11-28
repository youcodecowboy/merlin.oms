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
import { validateBinAvailability } from '@/lib/utils/bin-validation'
import { eventLogger } from '@/lib/utils/logging'
import { mockDB } from '@/lib/mock-db'
import type { Bin, InventoryItem } from '@/lib/types'

export function Inventory() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('items')
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false)
  const [showCreateBinDialog, setShowCreateBinDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreateClick = async () => {
    if (activeTab === 'items') {
      setLoading(true)
      try {
        const validation = await validateBinAvailability(mockDB.bins || [])
        if (!validation.valid) {
          toast({
            variant: "destructive",
            title: "Cannot Create Item",
            description: validation.error
          })
          return
        }
        setShowCreateItemDialog(true)
      } catch (error) {
        console.error('Bin validation failed:', error)
        toast({
          variant: "destructive",
          title: "System Error",
          description: "Failed to validate bin availability"
        })
      } finally {
        setLoading(false)
      }
    } else {
      setShowCreateBinDialog(true)
    }
  }

  const handleViewBin = async (bin: Bin) => {
    try {
      await eventLogger.logEvent({
        event_type: 'BIN_UPDATE',
        event_id: crypto.randomUUID(),
        timestamp: new Date(),
        actor_id: 'system',
        metadata: {
          action: 'view',
          bin_id: bin.id
        }
      })
      navigate(`/bins/${bin.id}`)
    } catch (error) {
      console.error('Failed to log bin view:', error)
    }
  }

  return (
    <PageLayout title="Inventory">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="bins">Bins</TabsTrigger>
          </TabsList>
          <Button 
            onClick={handleCreateClick}
            disabled={loading}
          >
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