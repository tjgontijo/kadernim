import { Skeleton } from '@/components/ui/skeleton'

interface DashPageSkeletonProps {
  showActions?: boolean
}

export function DashPageSkeleton({ showActions = true }: DashPageSkeletonProps) {
  return (
    <section className="flex-1 overflow-y-auto bg-background paper-grain pb-20">
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <header className="flex flex-col gap-4 border-b border-dashed border-line pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-5 w-96 max-w-full" />
            </div>
            {showActions && <Skeleton className="h-10 w-28 rounded-xl" />}
          </div>
        </header>

        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-5 border border-line bg-card p-5 space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
          <div className="rounded-5 border border-line bg-card p-5 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

