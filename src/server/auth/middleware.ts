import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'
import { hasRole, hasPermission, type Permission } from '@/lib/auth/roles'
import { UserRole, type UserRoleType } from '@/types/user-role'

export interface AuthenticatedRequest {
  userId: string
  userRole: UserRoleType | null
  email: string
}

/**
 * Middleware to require authentication
 * Returns user info if authenticated, else returns 401 response
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedRequest | NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return {
    userId: session.user.id,
    userRole: (session.user.role as UserRoleType) || UserRole.user,
    email: session.user.email || '',
  }
}

/**
 * Middleware to require a specific role
 * Checks if user has the required role or higher
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: UserRoleType
): Promise<AuthenticatedRequest | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (!hasRole(authResult.userRole, requiredRole)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient role' },
      { status: 403 }
    )
  }

  return authResult
}

/**
 * Middleware to require a specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<AuthenticatedRequest | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (!hasPermission(authResult.userRole, permission)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    )
  }

  return authResult
}

/**
 * Middleware to require a specific role AND permission
 */
export async function requireRoleAndPermission(
  request: NextRequest,
  requiredRole: UserRoleType,
  requiredPermission: Permission
): Promise<AuthenticatedRequest | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (!hasRole(authResult.userRole, requiredRole)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient role' },
      { status: 403 }
    )
  }

  if (!hasPermission(authResult.userRole, requiredPermission)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    )
  }

  return authResult
}
