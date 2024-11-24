import { z } from 'zod'

// Permission Types
export const permissionActions = [
  'view',
  'create',
  'update',
  'delete',
  'approve',
  'assign',
  'complete',
  'report'
] as const

export const permissionResources = [
  'orders',
  'inventory',
  'production',
  'customers',
  'requests',
  'measurements',
  'reports',
  'users',
  'teams'
] as const

export type PermissionAction = typeof permissionActions[number]
export type PermissionResource = typeof permissionResources[number]

export type Permission = `${PermissionAction}:${PermissionResource}`

// Role Types
export const roleTypes = [
  'ADMIN',
  'MANAGER',
  'TEAM_LEAD',
  'TEAM_MEMBER'
] as const

export type RoleType = typeof roleTypes[number]

// Team Types
export const teamTypes = [
  'PATTERN',
  'CUTTING',
  'SEWING',
  'WASHING',
  'FINISHING',
  'QC',
  'SHIPPING',
  'CUSTOMER_SERVICE'
] as const

export type TeamType = typeof teamTypes[number]

// Schema Definitions
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(roleTypes),
  teamId: z.string().uuid().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const teamSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(teamTypes),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string() as z.ZodType<Permission>),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const roleSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(roleTypes),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string() as z.ZodType<Permission>),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Type exports
export type User = z.infer<typeof userSchema>
export type Team = z.infer<typeof teamSchema>
export type Role = z.infer<typeof roleSchema>