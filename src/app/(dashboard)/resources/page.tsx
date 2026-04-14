'use client'

import { useState, useCallback } from 'react'
import { ResourceGrid } from '@/components/dashboard/resources/ResourceGrid'
import { ResourceFilters } from '@/components/dashboard/resources/ResourceFilters'
import { ResourceTabs } from '@/components/dashboard/resources/ResourceTabs'
import { useResourcesSummaryQuery } from '@/hooks/resources/use-resources'
import { useSessionQuery } from '@/hooks/auth/use-session'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { ResourceCardSkeleton } from '@/components/dashboard/shared/skeletons/resource-card-skeleton'

interface Filters {
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
}

export default function ResourcesPage() {
  const PAGE_SIZE = 20

  const [tab, setTab] = useState<'all' | 'mine' | 'free'>('all')
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

  const handleFiltersChange = useCallback((next: Filters) => {
    setFiltersByTab((prev: Record<string, Filters>) => {
      // Evita atualização se os filtros forem idênticos
      if (JSON.stringify(prev[tab]) === JSON.stringify(next)) return prev;
      
      return {
        ...prev,
        [tab]: {
          ...prev[tab],
          ...next,
        },
      }
    })
  }, [tab])

  // Determina se devemos mostrar o skeleton apenas na grid
  const showSkeleton = isLoading && items.length === 0

  return (
    <PageScaffold>
      {/* LINHA 1: Identidade & Ação */}
      <PageScaffold.Header
        title={<>Explorar <span className="text-primary italic">Materiais</span></>}
        action={null}
      />

      {/* LINHA 2: Destaque Visual (Seletor de Recursos) - ESTÁVEL */}
      <PageScaffold.Highlight className="space-y-4">
        <ResourceTabs
          value={tab}
          onValueChange={setTab}
          counts={counts}
        />
      </PageScaffold.Highlight>

      {/* LINHA 3: Controle e Busca - ESTÁVEL */}
      <PageScaffold.Controls>
        <ResourceFilters onFiltersChange={handleFiltersChange} tab={tab} />
      </PageScaffold.Controls>

      {/* Listagem de Grid ou Skeleton */}
      <section className="px-4 sm:px-0 min-h-[400px]">
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ResourceGrid
            items={items}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </section>
    </PageScaffold>
  )
}
