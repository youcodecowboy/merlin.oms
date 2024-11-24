import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FormDialog } from '@/components/forms/FormDialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { createMockRequest } from '@/lib/mock-api/requests'
import { getMockInventoryItems } from '@/lib/mock-api/inventory'
import { mockTeamMembers, requestTypeRoles } from '@/data/mock-auth/mock-data'
import { cn } from "@/lib/utils"
import type { InventoryItem } from '@/lib/schema'

const stepSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(['SCAN_QR', 'SCAN_BIN', 'CONFIRM']),
  order: z.number().min(1)
})

const formSchema = z.object({
  request_type: z.enum([
    'WASH_REQUEST',
    'STOCK_REQUEST',
    'CUTTING_REQUEST',
    'PATTERN_REQUEST',
    'FINISHING_REQUEST',
    'PACKING_REQUEST',
    'MOVE_REQUEST',
    'REMAKE_REQUEST'
  ]),
  request_name: z.string().min(1, "Request name is required"),
  request_description: z.string().optional(),
  assigned_to: z.string().min(1, "Assignee is required"),
  role: z.string().min(1, "Role is required"),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  deadline: z.string().optional(),
  inventory_item_id: z.string().optional(),
  steps: z.array(stepSchema).min(1, "At least one step is required")
})

type FormValues = z.infer<typeof formSchema>

interface CreateRequestDialogProps {
  onSuccess?: () => void
}

export function CreateRequestDialog({ onSuccess }: CreateRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [availableAssignees, setAvailableAssignees] = useState<typeof mockTeamMembers>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request_type: 'WASH_REQUEST',
      request_name: '',
      request_description: '',
      assigned_to: '',
      role: '',
      priority: 'MEDIUM',
      deadline: '',
      inventory_item_id: undefined,
      steps: []
    }
  })

  // Load inventory items
  useEffect(() => {
    async function loadInventoryItems() {
      try {
        const result = await getMockInventoryItems({
          page: 1,
          pageSize: 100,
          sortBy: 'created_at',
          sortOrder: 'desc'
        })
        setInventoryItems(result.items)
      } catch (error) {
        console.error('Failed to load inventory items:', error)
      }
    }
    if (open) {
      loadInventoryItems()
    }
  }, [open])

  // Update available roles when request type changes
  useEffect(() => {
    const requestType = form.watch('request_type')
    if (requestType) {
      const roles = requestTypeRoles[requestType] || []
      setAvailableRoles(roles)
      
      // Reset role and assignee when request type changes
      form.setValue('role', '')
      form.setValue('assigned_to', '')

      // Set default steps for wash request
      if (requestType === 'WASH_REQUEST') {
        form.setValue('steps', [
          {
            title: 'Scan Unit',
            description: 'Scan the QR code of the unit to begin the wash process',
            type: 'SCAN_QR',
            order: 1
          },
          {
            title: 'Move to Wash Station',
            description: 'Move the unit to the designated wash station and scan the bin',
            type: 'SCAN_BIN',
            order: 2
          },
          {
            title: 'Confirm Completion',
            description: 'Confirm that the wash process has been completed',
            type: 'CONFIRM',
            order: 3
          }
        ])
      }
    }
  }, [form.watch('request_type')])

  // Update available assignees when role changes
  useEffect(() => {
    const role = form.watch('role')
    if (role) {
      const filteredAssignees = mockTeamMembers.filter(member => 
        member.role === role
      )
      setAvailableAssignees(filteredAssignees)
      
      // Auto-select first assignee if available
      if (filteredAssignees.length > 0) {
        form.setValue('assigned_to', filteredAssignees[0].id)
      }
    }
  }, [form.watch('role')])

  const { execute: handleSubmit, loading } = useAsyncAction(async (values: FormValues) => {
    await createMockRequest(values)
    setOpen(false)
    form.reset()
    onSuccess?.()
  }, {
    successMessage: "Request created successfully"
  })

  const filteredItems = inventoryItems.filter(item => {
    const search = searchValue.toLowerCase()
    return item.sku.toLowerCase().includes(search)
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Create Request"
      triggerLabel="Create Request"
      loading={loading}
    >
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="request_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue('role', '')
                      form.setValue('assigned_to', '')
                      form.setValue('inventory_item_id', undefined)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WASH_REQUEST">Wash Request</SelectItem>
                      <SelectItem value="STOCK_REQUEST">Stock Request</SelectItem>
                      <SelectItem value="CUTTING_REQUEST">Cutting Request</SelectItem>
                      <SelectItem value="PATTERN_REQUEST">Pattern Request</SelectItem>
                      <SelectItem value="FINISHING_REQUEST">Finishing Request</SelectItem>
                      <SelectItem value="PACKING_REQUEST">Packing Request</SelectItem>
                      <SelectItem value="MOVE_REQUEST">Move Request</SelectItem>
                      <SelectItem value="REMAKE_REQUEST">Remake Request</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('request_type') === 'WASH_REQUEST' && (
              <FormField
                control={form.control}
                name="inventory_item_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Item</FormLabel>
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={searchOpen}
                          className="w-full justify-between"
                        >
                          {field.value ? 
                            inventoryItems.find(item => item.id === field.value)?.sku 
                            : "Select an item..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search items..." 
                            value={searchValue}
                            onValueChange={setSearchValue}
                          />
                          <CommandEmpty>No items found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-auto">
                            {filteredItems.map((item) => (
                              <CommandItem
                                key={item.id}
                                value={item.id}
                                onSelect={() => {
                                  form.setValue('inventory_item_id', item.id)
                                  form.setValue('request_name', `Wash Request - ${item.sku}`)
                                  setSearchOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    item.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-mono">{item.sku}</span>
                                  <span className="text-sm text-muted-foreground">
                                    Status: {item.status1} / {item.status2}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="request_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter request name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="request_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Enter request description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue('assigned_to', '') // Reset assignee when role changes
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.watch('role')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableAssignees.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Display steps in read-only mode for wash requests */}
            {form.watch('request_type') === 'WASH_REQUEST' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Steps</h4>
                {form.watch('steps').map((step, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <h5 className="font-medium">{step.title}</h5>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={!form.formState.isValid || loading}
              >
                Create Request
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </FormDialog>
  )
}