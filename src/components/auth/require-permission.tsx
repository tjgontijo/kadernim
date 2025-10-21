'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
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
        <Spinner className="h-8 w-8 text-indigo-500" />
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
