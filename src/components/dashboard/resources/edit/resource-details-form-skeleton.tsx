import { Skeleton } from '@/components/ui/skeleton'

interface ResourceDetailsFormSkeletonProps {
  showSecondarySections?: boolean
}

export function ResourceDetailsFormSkeleton({
  showSecondarySections = true,
}: ResourceDetailsFormSkeletonProps) {
  return (
    <div className="space-y-12 pb-32 animate-pulse">
      <div className="space-y-12">
        <section className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-7 w-64" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <Skeleton className="w-full aspect-square rounded-4" />
            </div>

            <div className="md:col-span-8 space-y-6">
              <Skeleton className="h-12 w-full rounded-3" />
              <Skeleton className="h-12 w-full rounded-3" />
              <Skeleton className="h-24 w-full rounded-3" />
              <Skeleton className="h-12 w-full rounded-3" />
            </div>
          </div>
        </section>

        {showSecondarySections && (
          <section className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-7 w-72" />
            </div>

            <Skeleton className="h-14 w-full rounded-3" />
            <Skeleton className="h-[320px] w-full rounded-3" />
            <Skeleton className="h-12 w-56 rounded-full ml-auto" />
          </section>
        )}
      </div>
    </div>
  )
}
