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

export function AdminContent({ user, children }: AdminContentProps) {
    return (
        <div className="flex-1 w-full min-h-0">
            {children}
        </div>
    )
}
