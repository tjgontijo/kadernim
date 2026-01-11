'use client'

import React from 'react'
import { z } from 'zod'

import { cn } from '@/lib/utils'

export const dashPageShellPropsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  padded: z.boolean().optional(),
})

export type DashPageShellProps = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  padded?: boolean
}

/**
 * Layout base para páginas de dashboard/analytics (não-CRUD).
 * Aplica padding consistente e cabeçalho opcional, sem interferir no CrudPageShell.
 */
export function DashPageShell({
  title,
  subtitle,
  actions,
  children,
  padded = true,
}: DashPageShellProps) {
  return (
    <section className="flex-1 overflow-y-auto bg-background">
      <div className={cn('flex flex-col gap-6', padded ? 'p-6 md:p-8' : 'p-0')}>
        {(title || subtitle || actions) && (
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </header>
        )}

        <div className="space-y-6">{children}</div>
      </div>
    </section>
  )
}
