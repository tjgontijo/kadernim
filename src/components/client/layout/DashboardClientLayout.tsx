'use client'

interface DashboardClientLayoutProps {
    children: React.ReactNode
}

export function DashboardClientLayout({ children }: DashboardClientLayoutProps) {
    return (
        <>
            {children}
        </>
    )
}
