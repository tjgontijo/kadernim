'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BarChart3, GitFork, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
  { id: 'split', label: 'Split de Pagamento', icon: GitFork },
  { id: 'audit', label: 'Auditoria', icon: History },
] as const

export type BillingTab = typeof TABS[number]['id']

export function BillingTabNav() {
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') || 'overview') as BillingTab

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <Link
              key={tab.id}
              href={`/admin/billing?tab=${tab.id}`}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
