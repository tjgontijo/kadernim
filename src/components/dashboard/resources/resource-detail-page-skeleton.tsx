import { Skeleton } from '@/components/ui/skeleton'

export function ResourceDetailPageSkeleton() {
  return (
    <div className="dashboard-page-container py-8 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-[48px] items-start tracking-tight">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <section className="bg-card border border-line rounded-5 p-[16px] relative shadow-2">
            <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
            
            <div className="flex gap-[16px] items-stretch">
              {/* Sidebar Skeletons */}
              <div className="w-[124px] flex-shrink-0 space-y-4">
                <Skeleton className="w-full aspect-[3/4] rounded-2" />
                <Skeleton className="w-full aspect-[3/4] rounded-2" />
                <Skeleton className="w-full aspect-[3/4] rounded-2" />
              </div>

              {/* Main Image Skeleton */}
              <div className="flex-1">
                <div className="aspect-[7/10] bg-paper-2 rounded-4 border border-line-soft overflow-hidden relative shadow-3">
                  <Skeleton className="h-full w-full rounded-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Overview Skeleton */}
          <section className="rounded-5 border border-line bg-card p-8 space-y-4">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[84%]" />
            <Skeleton className="h-4 w-[88%]" />
          </section>

          {/* More sections */}
          <section className="rounded-5 border border-line bg-card p-8 space-y-4">
            <Skeleton className="h-8 w-56 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </section>

          <section className="rounded-5 border border-line bg-card p-8 space-y-4">
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="sticky top-[64px] flex flex-col gap-[20px]">
          {/* Action Sidebar Skeleton (Files & Fav) */}
          <section className="rounded-4 border border-line bg-card p-6 space-y-6 relative">
            {/* Heart icon placeholder */}
            <div className="absolute top-[24px] right-[24px]">
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-4/5" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-dashed border-line space-y-3">
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-2" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-1/4" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-2" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-1/4" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Skeleton */}
          <section className="rounded-4 border border-line bg-card p-6 space-y-4">
            <div className="border-b border-dashed border-line pb-3 mb-2">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </section>

          {/* Lesson Plan Skeleton */}
          <section className="rounded-4 border border-line bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="border-t border-dashed border-line pt-4">
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </section>
        </aside>
      </div>

      {/* Related Strip Skeleton */}
      <section className="mt-16">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="aspect-[4/5] w-full rounded-5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
