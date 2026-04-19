'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils/index'

interface DashboardShellProps {
  children: ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <main 
      id="dashboard-main-content"
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden min-w-0 flex flex-col",
        className
      )}
    >
      {children}
    </main>
  )
}
