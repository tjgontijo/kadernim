import { PageScaffold, ScaffoldHeader, ScaffoldControls } from '@/components/dashboard/shared/page-scaffold'
import { ResourceCardSkeleton } from '@/components/dashboard/shared/skeletons/resource-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

interface ResourcesPageSkeletonProps {
  cardCount?: number
}

export function ResourcesPageSkeleton({ cardCount = 9 }: ResourcesPageSkeletonProps) {
  return (
    <PageScaffold>
      <ScaffoldHeader title={<Skeleton className="h-9 w-60 sm:h-10 sm:w-72" />} action={null} />

      <ScaffoldControls>
        <div className="flex items-center gap-2 w-full">
          <Skeleton className="h-11 sm:h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl shrink-0" />
        </div>
      </ScaffoldControls>

      <section className="px-0 min-h-[400px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: cardCount }).map((_, index) => (
            <ResourceCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </PageScaffold>
  )
}
