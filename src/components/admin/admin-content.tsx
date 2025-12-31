'use client'

import { ReactNode } from 'react'

interface AdminUser {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string | null
}

interface AdminContentProps {
    user: AdminUser
    children: ReactNode
}

/**
 * Wrapper component for admin content
 * Provides user context and can be extended for admin-specific features
 * (e.g., admin notifications, system alerts, etc.)
 */
export function AdminContent({ user, children }: AdminContentProps) {
    // Future enhancements can go here:
    // - Admin notifications banner
    // - System status alerts
    // - Admin-specific onboarding
    // - Quick actions overlay

    return (
        <>
            {children}
        </>
    )
}
