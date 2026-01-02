// Auth Client (React hooks and utilities)
export { authClient, useSession, signOut, changePassword } from './auth-client'

// Permissions (CASL integration)
export { defineAbilitiesFor } from './permissions'
export type { PermissionAction, PermissionSubject, Ability } from './permissions'

// Roles (role definitions and helpers)
export {
  rolePermissions,
  isAdmin,
  isSubscriber,
  isStaff,
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource,
  getHighestRole,
} from './roles'
export type { Permission } from './roles'
