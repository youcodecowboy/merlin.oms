import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Pencil, FileText, X, Download, History, Mail } from "lucide-react"
import { CustomerOverview } from './tabs/CustomerOverview'
import { CustomerMeasurements } from './tabs/CustomerMeasurements'
import { CustomerOrders } from './tabs/CustomerOrders'
import { CustomerActiveItems } from './tabs/CustomerActiveItems'
import { EditCustomerDialog } from './EditCustomerDialog'
import { AddNoteDialog } from './AddNoteDialog'
import { ContactCustomerDialog } from './ContactCustomerDialog'
import { cn } from "@/lib/utils"
import type { Customer } from "@/lib/schema"

interface CustomerProfileDrawerProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function CustomerProfileDrawer({
  customer,
  open,
  onClose,
  onUpdate
}: CustomerProfileDrawerProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)

  if (!customer) return null

  const getCustomerStatus = (customer: Customer) => {
    // This would be based on actual customer data/logic
    const orderCount = 5 // Example value
    if (orderCount > 10) return { label: 'VIP', variant: 'success' as const }
    if (orderCount > 1) return { label: '2nd+ Order', variant: 'info' as const }
    return { label: '1st Order', variant: 'default' as const }
  }

  const status = getCustomerStatus(customer)

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="space-y-4 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-xl">
                    {customer.name || 'Unnamed Customer'}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={status.variant}
                    className={cn(
                      "h-6 px-2 text-xs",
                      status.variant === 'success' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                      status.variant === 'info' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    )}
                  >
                    {status.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNoteDialogOpen(true)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 overflow-auto py-4">
              <Tabs defaultValue="overview" className="h-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="active-items">Active Items</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <CustomerOverview customer={customer} />
                </TabsContent>

                <TabsContent value="measurements" className="mt-4">
                  <CustomerMeasurements customerId={customer.id!} />
                </TabsContent>

                <TabsContent value="orders" className="mt-4">
                  <CustomerOrders customerId={customer.id!} />
                </TabsContent>

                <TabsContent value="active-items" className="mt-4">
                  <CustomerActiveItems customerId={customer.id!} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {}}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Details
                  </Button>
                  <Button variant="outline" onClick={() => setContactDialogOpen(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Customer
                  </Button>
                </div>
                <Button variant="outline" onClick={() => {}}>
                  <History className="h-4 w-4 mr-2" />
                  View Timeline
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <EditCustomerDialog
        customer={customer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={onUpdate}
      />

      <AddNoteDialog
        customerId={customer.id!}
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        onSuccess={onUpdate}
      />

      <ContactCustomerDialog
        customer={customer}
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
    </>
  )
}