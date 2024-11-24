import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Permission } from '@/data/mock-auth/types'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserTeam,
  getUserRole,
  isTeamLead,
  isManager,
  isAdmin
} from '@/lib/auth/permissions'

export function usePermissions() {
  const { user } = useAuth()

  const can = useCallback((permission: Permission): boolean => {
    if (!user?.id) return false
    return hasPermission(user.id, permission)
  }, [user])

  const canAny = useCallback((permissions: Permission[]): boolean => {
    if (!user?.id) return false
    return hasAnyPermission(user.id, permissions)
  }, [user])

  const canAll = useCallback((permissions: Permission[]): boolean => {
    if (!user?.id) return false
    return hasAllPermissions(user.id, permissions)
  }, [user])

  const userTeam = useCallback(() => {
    if (!user?.id) return null
    return getUserTeam(user.id)
  }, [user])

  const userRole = useCallback(() => {
    if (!user?.id) return null
    return getUserRole(user.id)
  }, [user])

  const isUserTeamLead = useCallback((): boolean => {
    if (!user?.id) return false
    return isTeamLead(user.id)
  }, [user])

  const isUserManager = useCallback((): boolean => {
    if (!user?.id) return false
    return isManager(user.id)
  }, [user])

  const isUserAdmin = useCallback((): boolean => {
    if (!user?.id) return false
    return isAdmin(user.id)
  }, [user])

  return {
    can,
    canAny,
    canAll,
    userTeam,
    userRole,
    isTeamLead: isUserTeamLead,
    isManager: isUserManager,
    isAdmin: isUserAdmin
  }
}