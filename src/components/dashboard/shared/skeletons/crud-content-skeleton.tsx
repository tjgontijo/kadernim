import type { ViewType } from '@/components/dashboard/crud/types'
import { cn } from '@/lib/utils/index'
import { Skeleton } from '@/components/ui/skeleton'

interface CrudContentSkeletonProps {
  view?: ViewType
  className?: string
  rows?: number
  cards?: number
}

export function CrudContentSkeleton({
  view = 'list',
  className,
  rows = 8,
  cards = 8,
}: CrudContentSkeletonProps) {
  if (view === 'cards') {
    return (
      <div className={cn('grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="border-t border-border/40 pt-3 flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      <div className="border-b border-border/60 px-4 py-3 flex items-center gap-4">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24 hidden md:block" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-4 py-3.5 flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3.5 w-2/5" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

