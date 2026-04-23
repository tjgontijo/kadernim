import { Skeleton } from '@/components/ui/skeleton'

export default function SubjectsLoading() {
  return (
    <div className="dashboard-page-container space-y-5 sm:space-y-6 pb-20 pt-4 sm:pt-6">
      <header className="flex items-center justify-between gap-4 px-0 pt-4 sm:pt-6">
        <Skeleton className="h-8 w-52 rounded-2xl" />
      </header>

      <section className="flex items-center gap-2 px-0">
        <Skeleton className="h-11 sm:h-12 w-full rounded-2xl" />
        <Skeleton className="h-11 sm:h-12 w-11 sm:w-28 rounded-2xl shrink-0" />
      </section>

      <section className="px-0 min-h-[420px]">
        <div className="rounded-xl border border-border bg-card shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden">
          <div className="grid grid-cols-[minmax(280px,1fr)_minmax(220px,0.6fr)_120px_96px] gap-0 bg-muted/80 border-b border-border">
            <div className="px-4 py-3">
              <Skeleton className="h-3 w-24 rounded-lg" />
            </div>
            <div className="px-4 py-3">
              <Skeleton className="h-3 w-16 rounded-lg" />
            </div>
            <div className="px-4 py-3 flex justify-center">
              <Skeleton className="h-3 w-16 rounded-lg" />
            </div>
            <div className="px-4 py-3" />
          </div>

          <div className="divide-y divide-border/40">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(280px,1fr)_minmax(220px,0.6fr)_120px_96px] items-center gap-0 px-0 py-0"
              >
                <div className="px-4 py-3 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                  <Skeleton className="h-5 w-44 rounded-lg" />
                </div>

                <div className="px-4 py-3 flex items-center gap-2">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                <div className="px-4 py-3 flex justify-center">
                  <Skeleton className="h-7 w-10 rounded-full" />
                </div>

                <div className="px-4 py-3 flex justify-end gap-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-8 right-8 z-50">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  )
}
