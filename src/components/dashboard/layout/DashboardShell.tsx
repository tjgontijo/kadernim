'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils/index'

interface DashboardShellProps {
  children: ReactNode
  sidebar: ReactNode
  className?: string
}

export function DashboardShell({ children, sidebar, className }: DashboardShellProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar Area */}
      {sidebar}

      {/* Main Content Area with Inset Effect */}
      <main className={cn(
        "bg-background flex-1 overflow-y-auto overflow-x-hidden",
        "md:rounded-tl-[2rem] md:shadow-inner-sm", // O efeito de painel arredondado do Whatrack
        className
      )}>
        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
