import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getMockCustomers } from '@/lib/mock-api/customers'
import { CreateCustomerDialog } from './CreateCustomerDialog'
import type { Customer } from '@/lib/schema'

interface CustomerSelectProps {
  selectedCustomer: Customer | null
  onSelect: (customer: Customer) => void
}

export function CustomerSelect({ selectedCustomer, onSelect }: CustomerSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleSearch = async () => {
    try {
      setLoading(true)
      const results = await getMockCustomers(searchQuery)
      setCustomers(results)
    } catch (error) {
      console.error('Failed to search customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = (customer: Customer) => {
    setCustomers(prev => [...prev, customer])
    setCreateDialogOpen(false)
    onSelect(customer)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Search Customer</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-4 space-y-2">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Searching...
            </div>
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <div
                key={customer.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCustomer?.id === customer.id
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelect(customer)}
              >
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.email}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery
                ? 'No customers found'
                : 'Search for a customer to begin'}
            </div>
          )}
        </div>
      </ScrollArea>

      <CreateCustomerDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
} 