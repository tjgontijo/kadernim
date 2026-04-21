'use client'

import { useState, useCallback } from 'react'
import { FavoriteCard } from '@/components/dashboard/favorites/FavoriteCard'
import { useResourcesSummaryQuery } from '@/hooks/resources/use-resources'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { ResourcesPageSkeleton } from '@/components/dashboard/resources/resources-page-skeleton'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Filters {
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const PAGE_SIZE = 50 // Show more in favorites

  const [filters] = useState<Filters>({})

  const {
    items,
    isLoading,
  } = useResourcesSummaryQuery({ tab: 'favorites', filters, pageSize: PAGE_SIZE })

  // Skeleton
  if (isLoading && items.length === 0) {
    return <ResourcesPageSkeleton />
  }

  return (
    <PageScaffold>
      <div className="relative pb-20">
        {/* Decorative elements for the "Mural" feel */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] grayscale bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] -z-10" />

        <PageScaffold.Header
          title={
            <div className="flex flex-col">
              <span className="font-hand text-terracotta text-2xl -mb-2 -rotate-1">Recortes e</span>
              <span className="font-display text-4xl font-bold italic">Favoritos</span>
            </div>
          }
          action={
            <Button 
                variant="outline" 
                onClick={() => router.push('/resources')}
                className="font-hand text-lg border-dashed border-terracotta/40 hover:bg-terracotta/5"
            >
                Explorar mais
            </Button>
          }
        />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
                <Heart className="h-20 w-20 text-line-soft fill-paper-2" />
                <Heart className="absolute inset-0 h-20 w-20 text-terracotta/20 animate-ping" />
            </div>
            <h2 className="font-display text-2xl font-medium text-ink mb-2">Seu mural está vazio</h2>
            <p className="text-ink-mute max-w-xs mx-auto font-hand text-lg">
                Vá até a biblioteca e clique no coração dos materiais que você mais gostar!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 px-4 sm:px-0 mt-8">
            {items.map((item, index) => (
              <FavoriteCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                thumbUrl={item.thumbUrl}
                educationLevel={item.educationLevel}
                subject={item.subject}
                subjectColor={item.subjectColor}
                subjectTextColor={item.subjectTextColor}
                hasAccess={item.hasAccess}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </PageScaffold>
  )
}
