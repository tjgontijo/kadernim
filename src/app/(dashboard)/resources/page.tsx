'use client'

import { useState, useCallback } from 'react'
import { ResourceGrid } from '@/components/dashboard/resources/ResourceGrid'
import { ResourceFilters } from '@/components/dashboard/resources/ResourceFilters'
import { useResourcesSummaryQuery } from '@/hooks/resources/use-resources'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { ResourcesPageSkeleton } from '@/components/dashboard/resources/resources-page-skeleton'
import { useSession } from '@/lib/auth/auth-client'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Filters {
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
}

export default function ResourcesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const PAGE_SIZE = 20

  const [filters, setFilters] = useState<Filters>({})

  const {
    items,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useResourcesSummaryQuery({ tab: 'all', filters, pageSize: PAGE_SIZE })

  const handleFiltersChange = useCallback((next: Filters) => {
    setFilters((prev: Filters) => {
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev
      return next
    })
  }, [])

  // Skeleton completo na primeira carga para evitar layout parcial antes dos dados
  if (isLoading && items.length === 0) {
    return <ResourcesPageSkeleton />
  }

  return (
    <PageScaffold>
      {/* LINHA 1: Identidade & Ação */}
      <PageScaffold.Header
        title={<>Explorar <span className="text-primary italic">Materiais</span></>}
        action={null}
      />


      {/* LINHA 3: Controle e Busca - ESTÁVEL */}
      <PageScaffold.Controls>
        <ResourceFilters onFiltersChange={handleFiltersChange} />
      </PageScaffold.Controls>

      {/* Listagem de Grid ou Skeleton */}
      <section className="px-4 sm:px-0 min-h-[400px]">
        <ResourceGrid
          items={items}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
        />
      </section>

      {/* Admin FAB */}
      {isAdmin && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
          <Button
            onClick={() => router.push('/resources/create')}
            className="w-14 h-14 rounded-full shadow-3xl bg-terracotta hover:bg-terracotta-hover text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
            size="icon"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>
      )}
    </PageScaffold>
  )
}
