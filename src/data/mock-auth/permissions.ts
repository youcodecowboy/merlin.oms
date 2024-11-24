import { Permission, PermissionAction, PermissionResource, permissionActions, permissionResources } from './types'

// Helper function to generate permissions for a resource
function generateResourcePermissions(resource: PermissionResource): Permission[] {
  return permissionActions.map(action => `${action}:${resource}` as Permission)
}

// Generate all possible permissions
export const ALL_PERMISSIONS = permissionResources.flatMap(generateResourcePermissions)

// Define permission sets for different roles
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
  
  MANAGER: [
    'view:orders',
    'view:inventory',
    'view:production',
    'view:customers',
    'view:requests',
    'view:reports',
    'view:users',
    'view:teams',
    'create:orders',
    'update:orders',
    'approve:orders',
    'assign:orders',
    'create:requests',
    'update:requests',
    'approve:requests',
    'assign:requests'
  ] as Permission[],

  TEAM_LEAD: [
    'view:orders',
    'view:inventory',
    'view:production',
    'view:requests',
    'create:requests',
    'update:requests',
    'approve:requests',
    'assign:requests',
    'complete:requests'
  ] as Permission[],

  TEAM_MEMBER: [
    'view:orders',
    'view:inventory',
    'view:production',
    'view:requests',
    'create:requests',
    'update:requests',
    'complete:requests'
  ] as Permission[]
}

// Define permission sets for different teams
export const TEAM_PERMISSIONS: Record<string, Permission[]> = {
  PATTERN: [
    'view:orders',
    'view:inventory',
    'create:requests',
    'update:requests',
    'complete:requests'
  ] as Permission[],

  CUTTING: [
    'view:orders',
    'view:inventory',
    'view:production',
    'create:requests',
    'update:requests',
    'complete:requests'
  ] as Permission[],

  SEWING: [
    'view:orders',
    'view:inventory',
    'view:production',
    'create:requests',
    'update:requests',
    'complete:requests'
  ] as Permission[],

  WASHING: [
    'view:orders',
    'view:inventory',
    'view:production',
    'create:requests',
    'update:requests',
    'complete:requests'
  ] as Permission[],

  FINISHING: [
    'view:orders',
    'view:inventory',
    'view:production',
    'create:requests',
    'update:requests',
    'complete:requests'
  ] as Permission[],

  QC: [
    'view:orders',
    'view:inventory',
    'view:production',
    'create:requests',
    'update:requests',
    'complete:requests',
    'report:requests'
  ] as Permission[],

  SHIPPING: [
    'view:orders',
    'view:inventory',
    'create:requests',
    'update:requests',
    'complete:requests'
  ] as Permission[],

  CUSTOMER_SERVICE: [
    'view:orders',
    'view:customers',
    'view:inventory',
    'create:requests',
    'update:requests'
  ] as Permission[]
}