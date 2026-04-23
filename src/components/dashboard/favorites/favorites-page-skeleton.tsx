'use client'

import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

const rotations = [
  'rotate-[-1.8deg]',
  'rotate-[1.5deg]',
  'rotate-[-2.2deg]',
  'rotate-[1.9deg]',
  'rotate-[-1.4deg]',
  'rotate-[2.1deg]',
]

function FavoriteCardSkeleton({ index }: { index: number }) {
  const rotation = rotations[index % rotations.length]
  return (
    <div className={`relative ${rotation}`}>
      {/* Tape */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-terracotta/10 border-x border-dashed border-terracotta/20 z-20 rotate-[-2deg]" />

      <Card className="flex flex-col overflow-hidden border-line-soft bg-card shadow-lg rounded-none p-4 pb-3">
        {/* Square image area */}
        <div className="relative aspect-square bg-paper-2 overflow-hidden border border-line-soft rounded-[12px]">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,oklch(0.88_0.02_75_/_0.5)_10px,oklch(0.88_0.02_75_/_0.5)_11px)] opacity-20 z-10" />
        </div>

        {/* Content */}
        <div className="flex flex-col pt-4 gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-[90%]" />
              <Skeleton className="h-5 w-[65%]" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0 -mt-0.5" />
          </div>

          <Skeleton className="h-px w-full" />

          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </Card>
    </div>
  )
}

export function FavoritesPageSkeleton({ cardCount = 8 }: { cardCount?: number }) {
  return (
    <PageScaffold>
      <PageScaffold.Header
        title={
          <div className="flex flex-col">
            <Skeleton className="h-7 w-28 -mb-1" />
            <Skeleton className="h-10 w-44 mt-1" />
          </div>
        }
        action={<Skeleton className="h-10 w-32 rounded-full" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 px-0 mt-8 pb-20">
        {Array.from({ length: cardCount }).map((_, i) => (
          <FavoriteCardSkeleton key={i} index={i} />
        ))}
      </div>
    </PageScaffold>
  )
}
