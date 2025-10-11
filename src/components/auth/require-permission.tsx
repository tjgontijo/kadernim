'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/hooks/use-permissions'

interface RequirePermissionProps {
  children: React.ReactNode
  permissions?: string[]
  roles?: string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export function RequirePermission({
  children,
  permissions,
  roles,
  redirectTo = '/auth/signin',
  fallback,
}: RequirePermissionProps) {
  const router = useRouter()
  const { loading, hasAccess } = usePermissions({
    required: permissions,
    requiredRoles: roles,
    redirectTo,
  })

  useEffect(() => {
    if (!loading && !hasAccess && redirectTo) {
      router.push(redirectTo)
    }
  }, [loading, hasAccess, redirectTo, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  return <>{children}</>
}
