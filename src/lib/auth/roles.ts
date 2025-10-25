import { UserRole, type UserRoleType } from '@/types/user-role';

export type Permission = 
  | 'read:profile'
  | 'update:profile'
  | 'delete:profile'
  | 'read:subscription'
  | 'manage:subscription'
  | 'read:courses'
  | 'enroll:courses'
  | 'read:admin'
  | 'manage:users'
  | 'manage:courses'
  | 'manage:system'

export const rolePermissions: Record<UserRoleType, Permission[]> = {
  [UserRole.user]: [
    'read:profile',
    'update:profile',
    'read:courses',
  ],
  [UserRole.subscriber]: [
    'read:profile',
    'update:profile',
    'read:subscription',
    'manage:subscription',
    'read:courses',
    'enroll:courses',
  ],
  [UserRole.admin]: [
    'read:profile',
    'update:profile',
    'delete:profile',
    'read:subscription',
    'manage:subscription',
    'read:courses',
    'enroll:courses',
    'read:admin',
    'manage:users',
    'manage:courses',
    'manage:system',
  ],
}

export function hasRole(userRole: UserRoleType | null | undefined, requiredRole: UserRoleType): boolean {
  if (!userRole) return false
  
  // Admin tem acesso a tudo
  if (userRole === UserRole.admin) return true
  
  // Subscriber tem acesso a user
  if (requiredRole === UserRole.user && userRole === UserRole.subscriber) return true
  
  return userRole === requiredRole
}

export function isSubscriber(userRole: UserRoleType | null | undefined): boolean {
  return userRole === UserRole.subscriber || userRole === UserRole.admin
}

export function isAdmin(userRole: UserRoleType | null | undefined): boolean {
  return hasRole(userRole, UserRole.admin)
}

export function hasPermission(
  userRole: UserRoleType | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false
  
  const permissions = rolePermissions[userRole]
  return permissions.includes(permission)
}

export function hasAnyPermission(
  userRole: UserRoleType | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false
  
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(
  userRole: UserRoleType | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false
  
  return permissions.every(permission => hasPermission(userRole, permission))
}

export function canAccessResource(
  userRole: UserRoleType | null | undefined,
  resourcePermission: Permission
): boolean {
  return hasPermission(userRole, resourcePermission)
}

export function getHighestRole(
  currentRole: UserRoleType | null | undefined,
  hasActiveSubscription: boolean
): UserRoleType {
  // Admin sempre mantém admin
  if (currentRole === UserRole.admin) {
    return UserRole.admin
  }
  
  // Se tem subscription ativa, é subscriber
  // Se não tem, é user
  return hasActiveSubscription ? UserRole.subscriber : UserRole.user
}