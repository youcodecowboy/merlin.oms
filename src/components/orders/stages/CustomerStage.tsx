import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer } from "@/lib/schema"

interface CustomerStageProps {
  form: UseFormReturn<any>
  customers: Customer[]
  onNext: () => void
}

export function CustomerStage({ form, customers, onNext }: CustomerStageProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)

  const filteredCustomers = customers.filter(customer => {
    const search = searchValue.toLowerCase()
    return (
      customer.email.toLowerCase().includes(search) ||
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search)
    )
  })

  const selectedCustomer = customers.find(c => c.id === form.getValues('customer_id'))

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }} className="space-y-6">
        {!showNewCustomerForm ? (
          <>
            <div className="flex flex-col space-y-4">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between"
                  >
                    {selectedCustomer ? selectedCustomer.email : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search customers..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandEmpty>No customers found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.id}
                          onSelect={() => {
                            form.setValue('customer_id', customer.id)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customer.id === form.getValues('customer_id')
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{customer.email}</span>
                            {customer.name && (
                              <span className="text-sm text-muted-foreground">
                                {customer.name}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowNewCustomerForm(true)}
                >
                  Create New Customer
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newCustomer.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="customer@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newCustomer.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newCustomer.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+1 (555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowNewCustomerForm(false)}
                >
                  Back to Search
                </Button>
                <Button type="submit">Create & Continue</Button>
              </div>
            </div>
          </>
        )}

        {!showNewCustomerForm && (
          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={!form.getValues('customer_id')}
            >
              Next
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}