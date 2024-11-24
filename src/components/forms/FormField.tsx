import React from 'react'
import {
  FormControl,
  FormField as BaseFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"

interface FormFieldProps {
  form: UseFormReturn<any>
  name: string
  label: string
  type?: string
  placeholder?: string
  control?: React.ReactElement
}

export function FormField({
  form,
  name,
  label,
  type = "text",
  placeholder,
  control
}: FormFieldProps) {
  return (
    <BaseFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {control ? (
              React.cloneElement(control, { ...field })
            ) : (
              <Input 
                type={type} 
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}