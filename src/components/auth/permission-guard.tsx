'use client'

import React, { useMemo } from 'react'
import { useSession } from '@/lib/auth/auth-client'
import { UserRoleType } from '@/types/user-role'
import { defineAbilitiesFor, PermissionAction, PermissionSubject } from '@/lib/auth/permissions'

interface PermissionGuardProps {
    roles?: UserRoleType[]
    action?: PermissionAction
    subject?: PermissionSubject
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function useAbility() {
    const { data: session } = useSession()
    const role = (session?.user as any)?.role as UserRoleType || 'user'

    return useMemo(() => defineAbilitiesFor(role), [role])
}

export function PermissionGuard({
    roles,
    action,
    subject,
    children,
    fallback = null
}: PermissionGuardProps) {
    const { data: session, isPending } = useSession()
    const ability = useAbility()

    if (isPending) return null

    const userRole = (session?.user as any)?.role as UserRoleType || 'user'

    // Check by roles list (simple check)
    if (roles && roles.length > 0) {
        if (!roles.includes(userRole)) {
            return <>{fallback}</>
        }
    }

    // Check by specific action/subject
    if (action && subject) {
        if (!ability.can(action, subject)) {
            return <>{fallback}</>
        }
    }

    return <>{children}</>
}
