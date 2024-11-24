import React, { useState } from 'react'
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
import { cn } from "@/lib/utils"

interface SearchableSelectProps<T> {
  items: T[]
  value?: string
  onSelect: (item: T) => void
  getDisplayValue: (item?: T) => string
  getSearchValue: (item: T) => string
  getItemId: (item: T) => string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  triggerClassName?: string
}

export function SearchableSelect<T>({
  items,
  value,
  onSelect,
  getDisplayValue,
  getSearchValue,
  getItemId,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  triggerClassName
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const selectedItem = items.find(item => getItemId(item) === value)

  const filteredItems = items.filter(item => 
    getSearchValue(item).toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            triggerClassName
          )}
        >
          {selectedItem ? getDisplayValue(selectedItem) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredItems.map((item) => (
              <CommandItem
                key={getItemId(item)}
                value={getItemId(item)}
                onSelect={() => {
                  onSelect(item)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === getItemId(item) ? "opacity-100" : "opacity-0"
                  )}
                />
                {getDisplayValue(item)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}