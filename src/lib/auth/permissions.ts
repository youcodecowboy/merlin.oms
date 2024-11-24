import { Permission, User, Team, Role } from '@/data/mock-auth/types'
import { mockUsers, mockTeams, mockRoles } from '@/data/mock-auth/mock-data'

export function getUserPermissions(userId: string): Permission[] {
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return []

  // Get role permissions
  const role = mockRoles.find(r => r.type === user.role)
  const rolePermissions = role?.permissions || []

  // Get team permissions if user is assigned to a team
  const team = user.teamId ? mockTeams.find(t => t.id === user.teamId) : null
  const teamPermissions = team?.permissions || []

  // Combine and deduplicate permissions
  return Array.from(new Set([...rolePermissions, ...teamPermissions]))
}

export function hasPermission(userId: string, requiredPermission: Permission): boolean {
  const permissions = getUserPermissions(userId)
  return permissions.includes(requiredPermission)
}

export function hasAnyPermission(userId: string, requiredPermissions: Permission[]): boolean {
  const permissions = getUserPermissions(userId)
  return requiredPermissions.some(p => permissions.includes(p))
}

export function hasAllPermissions(userId: string, requiredPermissions: Permission[]): boolean {
  const permissions = getUserPermissions(userId)
  return requiredPermissions.every(p => permissions.includes(p))
}

export function getUserTeam(userId: string): Team | null {
  const user = mockUsers.find(u => u.id === userId)
  if (!user?.teamId) return null
  return mockTeams.find(t => t.id === user.teamId) || null
}

export function getUserRole(userId: string): Role | null {
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return null
  return mockRoles.find(r => r.type === user.role) || null
}

export function isTeamLead(userId: string): boolean {
  const user = mockUsers.find(u => u.id === userId)
  return user?.role === 'TEAM_LEAD'
}

export function isManager(userId: string): boolean {
  const user = mockUsers.find(u => u.id === userId)
  return user?.role === 'MANAGER'
}

export function isAdmin(userId: string): boolean {
  const user = mockUsers.find(u => u.id === userId)
  return user?.role === 'ADMIN'
}