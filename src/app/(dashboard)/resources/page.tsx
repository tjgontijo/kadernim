'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { ResourceGrid } from '@/components/dashboard/resources/ResourceGrid'
import { ResourceFilters } from '@/components/dashboard/resources/ResourceFilters'
import { ResourceTabs, type ResourceTab } from '@/components/dashboard/resources/ResourceTabs'
import { ResourceUpsellBanner } from '@/components/dashboard/resources/ResourceUpsellBanner'
import { useResourcesQuery } from '@/hooks/useResourcesQuery'
import { useSessionQuery } from '@/hooks/useSessionQuery'
import { useResourceCounts, type ResourceCountFilters } from '@/hooks/useResourceCounts'

interface Filters {
  q?: string
  educationLevel?: string
  subject?: string
}

export default function ResourcesPage() {
  const [tab, setTab] = useState<ResourceTab>('mine')
  const [filtersByTab, setFiltersByTab] = useState<Record<ResourceTab, Filters>>({
    mine: {},
    free: {},
    all: {},
  })

  const PAGE_SIZE = 20

  const filters = filtersByTab[tab]
  const { items, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useResourcesQuery({ tab, filters, pageSize: PAGE_SIZE })

  const queryClient = useQueryClient()
  const { data: session } = useSessionQuery()
  const role = session?.data?.user?.role ?? null
  const isSubscriber = role === 'subscriber'
  const isAdmin = role === 'admin'
  const isCommonUser = !isSubscriber && !isAdmin

  const normalizedFiltersByTab = useMemo<Record<ResourceTab, ResourceCountFilters>>(() => {
    const normalize = (f: Filters): ResourceCountFilters => {
      const qTrimmed = f.q?.trim() ?? ''
      return {
        q: qTrimmed.length >= 2 ? qTrimmed : undefined,
        educationLevel: f.educationLevel,
        subject: f.subject,
      }
    }

    return {
      mine: normalize(filtersByTab.mine),
      free: normalize(filtersByTab.free),
      all: normalize(filtersByTab.all),
    }
  }, [filtersByTab])

  const { counts: tabCounts } = useResourceCounts({ filtersByTab: normalizedFiltersByTab })

  useEffect(() => {
    const prefetch = async () => {
      const doPrefetch = async (t: ResourceTab) => {
        const key = ['resources', `tab:${t}`, {}, 20] as const
        await queryClient.prefetchInfiniteQuery({
          queryKey: key,
          queryFn: async () => {
            const params = new URLSearchParams()
            params.set('page', '1')
            params.set('limit', '20')
            params.set('tab', t)
            const res = await fetch(`/api/v1/resources?${params.toString()}`)
            if (!res.ok) throw new Error('Falha ao prefetch de recursos')
            return res.json()
          },
          initialPageParam: 1,
        })
      }
      await doPrefetch('mine')
      await doPrefetch('free')
    }
    prefetch()
  }, [queryClient])

  const handleSubscribe = (): void => {
    window.open('https://seguro.profdidatica.com.br/r/TMNDJH4WEN', '_blank', 'noopener,noreferrer')
  }

  const handleFiltersChange = useCallback((next: Filters) => {
    setFiltersByTab(prev => {
      const current = prev[tab]
      const merged = { ...current, ...next }
      const cleaned = Object.fromEntries(
        Object.entries(merged).filter(([, value]) => value !== undefined)
      ) as Filters
      return { ...prev, [tab]: cleaned }
    })
  }, [tab])

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {isCommonUser && (
        <section className="sm:max-w-none">
          <ResourceUpsellBanner onSubscribe={handleSubscribe} />
        </section>
      )}

      <section className="sm:max-w-none">
        <ResourceFilters onFiltersChange={handleFiltersChange} tab={tab} />
      </section>

      <section className="sm:max-w-none">
        <ResourceTabs value={tab} onValueChange={setTab} counts={tabCounts} />
      </section>

      <section className="sm:max-w-none pt-2">
        <ResourceGrid
          items={items}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          onSubscribe={handleSubscribe}
        />
      </section>
    </div>
  )
}
