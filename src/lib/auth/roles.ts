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
  | 'delete:users'
  | 'manage:courses'
  | 'manage:resources'
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
  [UserRole.editor]: [
    'read:profile',
    'update:profile',
    'read:admin',
    'read:courses',
    'manage:resources',
  ],
  [UserRole.manager]: [
    'read:profile',
    'update:profile',
    'read:subscription',
    'manage:subscription',
    'read:courses',
    'enroll:courses',
    'read:admin',
    'manage:users',
    'manage:resources',
    'manage:courses',
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
    'delete:users',
    'manage:courses',
    'manage:resources',
    'manage:system',
  ],
}

// Hierarquia de pesos para comparação (maior = mais poder)
const ROLE_WEIGHTS: Record<UserRoleType, number> = {
  [UserRole.user]: 0,
  [UserRole.subscriber]: 1,
  [UserRole.editor]: 2,
  [UserRole.manager]: 3,
  [UserRole.admin]: 10,
}

export function hasRole(userRole: UserRoleType | null | undefined, requiredRole: UserRoleType): boolean {
  if (!userRole) return false

  const userWeight = ROLE_WEIGHTS[userRole] ?? 0
  const requiredWeight = ROLE_WEIGHTS[requiredRole] ?? 0

  return userWeight >= requiredWeight
}

export function isSubscriber(userRole: UserRoleType | null | undefined): boolean {
  if (!userRole) return false
  return hasRole(userRole, UserRole.subscriber)
}

export function isStaff(userRole: UserRoleType | null | undefined): boolean {
  if (!userRole) return false
  return hasRole(userRole, UserRole.editor)
}

export function isAdmin(userRole: UserRoleType | null | undefined): boolean {
  return userRole === UserRole.admin
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