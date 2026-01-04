'use client'

import { useState, useCallback } from 'react'

import { ResourceGrid } from '@/components/client/resources/ResourceGrid'
import { ResourceFilters } from '@/components/client/resources/ResourceFilters'
import { ResourceTabs } from '@/components/client/resources/ResourceTabs'
import { ResourceUpsellBanner } from '@/components/client/resources/ResourceUpsellBanner'
import { useResourcesSummaryQuery } from '@/hooks/useResourcesSummaryQuery'
import { useSessionQuery } from '@/hooks/useSessionQuery'
import { PageHeader } from '@/components/client/shared/page-header'
import { BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Filters {
  q?: string
  educationLevel?: string
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

  return (
    <div className="w-full space-y-4">
      <PageHeader
        icon={BookOpen}
        title={<>Explorar <span className="text-primary italic">Materiais</span></>}
        action={
          <Button asChild variant="outline" className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 font-bold transition-all group">
            <Link href="/community">
              <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              Fazer Pedido
            </Link>
          </Button>
        }
      />

      {isCommonUser && (
        <section>
          <ResourceUpsellBanner onSubscribe={handleSubscribe} />
        </section>
      )}

      <section>
        <ResourceFilters onFiltersChange={handleFiltersChange} tab={tab} />
      </section>

      <section>
        <ResourceTabs
          value={tab}
          onValueChange={setTab}
          counts={counts}
        />
      </section>

      <section className="pt-2">
        <ResourceGrid
          items={items}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
        />
      </section>
    </div>
  )
}
