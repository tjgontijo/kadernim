'use client'

import { useState, useCallback } from 'react'
import { ResourceGrid } from '@/components/dashboard/resources/ResourceGrid'
import { ResourceFilters } from '@/components/dashboard/resources/ResourceFilters'
import { ResourceTabs } from '@/components/dashboard/resources/ResourceTabs'
import { useResourcesSummaryQuery } from '@/hooks/resources/use-resources'
import { useSessionQuery } from '@/hooks/auth/use-session'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { PageScaffoldSkeleton } from '@/components/dashboard/shared/skeletons/page-scaffold-skeleton'
import { ResourceCardSkeleton } from '@/components/dashboard/shared/skeletons/resource-card-skeleton'

interface Filters {
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
}

export default function ResourcesPage() {
  const PAGE_SIZE = 20

  const [tab, setTab] = useState<'all' | 'mine' | 'free'>('mine')
  const [filtersByTab, setFiltersByTab] = useState<Record<string, Filters>>({
    all: {},
    mine: {},
    free: {},
  })

  const filters = filtersByTab[tab]

  const {
    items,
    counts,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useResourcesSummaryQuery({ tab, filters, pageSize: PAGE_SIZE })

  const { data: session } = useSessionQuery()
  const role = session?.data?.user?.role ?? null

  const isSubscriber = role === 'subscriber'
  const isAdmin = role === 'admin'
  const isCommonUser = !isSubscriber && !isAdmin

  const handleFiltersChange = useCallback((next: Filters) => {
    setFiltersByTab((prev: Record<string, Filters>) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        ...next,
      },
    }))
  }, [tab])

  const handleSubscribe = () => {
    window.open('https://seguro.profdidatica.com.br/r/TMNDJH4WEN', '_blank', 'noopener,noreferrer')
  }

  if (isLoading && items.length === 0) {
    return (
      <PageScaffoldSkeleton
        CardSkeleton={ResourceCardSkeleton}
        cardCount={8}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
      />
    )
  }

  return (
    <PageScaffold>
      {/* LINHA 1: Identidade & Ação (Modelo: Título | Botão Discreto) */}
      <PageScaffold.Header
        title={<>Explorar <span className="text-primary italic">Materiais</span></>}
        action={null}
      />

      {/* LINHA 2: Destaque Visual (Seletor de Recursos) */}
      <PageScaffold.Highlight className="space-y-4">
        <ResourceTabs
          value={tab}
          onValueChange={setTab}
          counts={counts}
        />
      </PageScaffold.Highlight>

      {/* LINHA 3: Controle e Busca (Filtro query | Botão Drawer) */}
      <PageScaffold.Controls>
        <ResourceFilters onFiltersChange={handleFiltersChange} tab={tab} />
      </PageScaffold.Controls>

      {/* Listagem de Grid */}
      <section className="px-4 sm:px-0">
        <ResourceGrid
          items={items}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
        />
      </section>
    </PageScaffold>
  )
}
