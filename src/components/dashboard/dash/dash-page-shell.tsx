import React from 'react'
import { cn } from '@/lib/utils/index'

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
    <section className="flex-1 overflow-y-auto bg-background paper-grain pb-20">
      <div className={cn('dashboard-page-container flex flex-col gap-8', padded ? 'py-6 md:py-10' : 'py-0')}>
        {(title || subtitle || actions) && (
          <header className="flex flex-col gap-4 border-b border-dashed border-line pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-display-m font-medium tracking-tight">{title}</h1>
                {subtitle && <p className="text-body text-ink-mute max-w-2xl">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
            </div>
          </header>
        )}

        <div className="space-y-8">{children}</div>
      </div>
    </section>
  )
}
