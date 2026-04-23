import { Skeleton } from '@/components/ui/skeleton'

export default function AdminUsersLoading() {
  return (
    <div className="dashboard-page-container space-y-5 sm:space-y-6 pb-20 pt-4 sm:pt-6">
      <header className="flex items-center justify-between gap-4 px-0 pt-4 sm:pt-6">
        <Skeleton className="h-8 w-40 rounded-2xl" />
      </header>

      <section className="flex items-center gap-2 px-0">
        <Skeleton className="h-11 sm:h-12 w-full rounded-2xl" />
        <Skeleton className="h-11 sm:h-12 w-11 sm:w-28 rounded-2xl shrink-0" />
      </section>

      <section className="px-0 min-h-[420px]">
        <div className="rounded-xl border border-border bg-card shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden">
          <div className="grid grid-cols-[minmax(320px,1fr)_140px_180px_90px_90px_120px_112px] gap-0 bg-muted/80 border-b border-border/40">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="px-4 py-3">
                {index < 6 ? <Skeleton className="h-3 w-20 rounded-lg" /> : null}
              </div>
            ))}
          </div>
          <div className="divide-y divide-border/40">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[minmax(320px,1fr)_140px_180px_90px_90px_120px_112px] items-center">
                <div className="px-4 py-3 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40 rounded-lg" />
                    <Skeleton className="h-3 w-56 rounded-lg" />
                  </div>
                </div>
                <div className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></div>
                <div className="px-4 py-3"><Skeleton className="h-6 w-28 rounded-full" /></div>
                <div className="px-4 py-3 flex justify-center"><Skeleton className="h-4 w-4 rounded-full" /></div>
                <div className="px-4 py-3 flex justify-center"><Skeleton className="h-7 w-9 rounded-full" /></div>
                <div className="px-4 py-3"><Skeleton className="h-4 w-20 rounded-lg" /></div>
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
