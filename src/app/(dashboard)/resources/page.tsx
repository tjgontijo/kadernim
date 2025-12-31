'use client'

import { useState, useCallback } from 'react'

import { ResourceGrid } from '@/components/dashboard/resources/ResourceGrid'
import { ResourceFilters } from '@/components/dashboard/resources/ResourceFilters'
import { ResourceTabs } from '@/components/dashboard/resources/ResourceTabs'
import { ResourceUpsellBanner } from '@/components/dashboard/resources/ResourceUpsellBanner'
import { useResourcesSummaryQuery } from '@/hooks/useResourcesSummaryQuery'
import { useSessionQuery } from '@/hooks/useSessionQuery'

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
    <div className="w-full space-y-6 sm:space-y-8">

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
