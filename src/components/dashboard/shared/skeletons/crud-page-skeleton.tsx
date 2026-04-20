import { CrudContentSkeleton } from '@/components/dashboard/shared/skeletons/crud-content-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function CrudPageSkeleton() {
  return (
    <section className="flex flex-col h-full overflow-hidden bg-background">
      <div className="hidden md:flex flex-col border-b border-border bg-background mt-6">
        <div className="flex flex-col gap-2 px-6 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="px-6 pb-2">
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
      </div>

      <div className="hidden md:flex flex-col gap-4 py-3 md:flex-row md:items-center md:justify-between px-6 border-b border-border/50 bg-muted/5">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          <Skeleton className="h-8 w-full max-w-[320px] rounded-md" />
          <div className="h-4 w-[1px] bg-border mx-2" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-3 p-4 border-b bg-background">
        <Skeleton className="h-7 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <CrudContentSkeleton view="list" className="p-4 md:p-6 pb-20" />
      </div>

      <div className="border-t border-border bg-background py-2 shrink-0 px-6 h-14 flex items-center">
        <Skeleton className="h-4 w-36" />
      </div>

      <Skeleton className="fixed bottom-20 right-8 h-14 w-14 rounded-full z-50" />
    </section>
  )
}

