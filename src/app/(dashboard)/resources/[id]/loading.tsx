// src/app/(dashboard)/resources/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { PageLoadingSpinner } from '@/components/ui/loading-spinner'

export default function Loading() {
  return (
    <main className="container mx-auto max-w-4xl space-y-10 px-4 py-10">
      <article className="space-y-8">
        {/* Image Skeleton */}
        <div className="overflow-hidden rounded-3xl border bg-muted/40 shadow-sm">
          <Skeleton className="aspect-video w-full" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {/* Badges Skeleton */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          {/* Title Skeleton */}
          <Skeleton className="h-10 w-3/4" />

          {/* Description Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Action Button Skeleton */}
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>

        {/* Files Section Skeleton */}
        <Card className="p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </Card>

        {/* Loading Spinner */}
        <div className="flex justify-center py-8">
          <PageLoadingSpinner />
        </div>
      </article>
    </main>
  )
}
