import { Skeleton } from '@/components/ui/skeleton'

export function ResourceDetailPageSkeleton() {
  return (
    <div className="dashboard-page-container py-8 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-[48px] items-start tracking-tight">
        {/* LEFT COLUMN */}
        <div className="space-y-[32px]">
          {/* Gallery Skeleton */}
          <section className="bg-card border border-line rounded-5 p-[16px] relative shadow-2">
            <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
            
            <div className="flex gap-[16px] items-stretch">
              {/* Sidebar Skeletons */}
              <div className="w-[124px] flex-shrink-0 flex flex-col gap-[16px]">
                <Skeleton className="w-full aspect-square rounded-2 bg-muted/40" />
                <Skeleton className="w-full aspect-square rounded-2 bg-muted/40" />
                <Skeleton className="w-full aspect-square rounded-2 bg-muted/40" />
              </div>

              {/* Main Image Skeleton */}
              <div className="flex-1">
                <div className="aspect-square bg-paper-2 rounded-4 border border-line-soft overflow-hidden relative shadow-3">
                  <Skeleton className="h-full w-full rounded-none bg-muted/40" />
                </div>
              </div>
            </div>
          </section>

          {/* Overview Skeleton */}
          <section className="rounded-5 border border-line bg-card p-8 space-y-6">
            <Skeleton className="h-7 w-48 bg-muted/40" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-muted/30" />
              <Skeleton className="h-4 w-[92%] bg-muted/30" />
              <Skeleton className="h-4 w-[84%] bg-muted/30" />
              <Skeleton className="h-4 w-[88%] bg-muted/30" />
            </div>
          </section>

          {/* Objectives Skeleton */}
          <section className="rounded-5 border border-line bg-card p-8 space-y-6">
            <Skeleton className="h-7 w-56 bg-muted/40" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl bg-muted/30" />
              <Skeleton className="h-16 w-full rounded-2xl bg-muted/30" />
            </div>
          </section>

          {/* Timeline Skeleton */}
          <section className="rounded-5 border border-line bg-card p-8 space-y-6">
            <Skeleton className="h-7 w-40 bg-muted/40" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl bg-muted/30" />
              <Skeleton className="h-32 w-full rounded-2xl bg-muted/30" />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="sticky top-[64px] flex flex-col gap-[20px]">
          {/* Action Sidebar Skeleton */}
          <section className="rounded-4 border border-line bg-card p-[24px] shadow-2 relative">
            {/* Heart icon placeholder */}
            <div className="absolute top-[24px] right-[24px]">
              <Skeleton className="h-9 w-9 rounded-full bg-muted/40" />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-[6px] mb-[14px]">
              <Skeleton className="h-[24px] w-[80px] rounded-full bg-muted/40" />
              <Skeleton className="h-[24px] w-[100px] rounded-full bg-muted/40" />
            </div>

            {/* Title */}
            <div className="space-y-2 mb-[18px]">
              <Skeleton className="h-8 w-full bg-muted/50" />
              <Skeleton className="h-8 w-[70%] bg-muted/50" />
            </div>

            {/* Author */}
            <div className="flex items-center gap-[8px] mb-[20px]">
              <Skeleton className="h-[26px] w-[120px] rounded-full bg-muted/30" />
            </div>
            
            {/* Files List */}
            <div className="pt-[16px] border-t border-dashed border-line space-y-4">
              <Skeleton className="h-4 w-32 bg-muted/40 mb-2" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-2 bg-muted/30" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4 bg-muted/30" />
                    <Skeleton className="h-2 w-1/4 bg-muted/20" />
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-2 bg-muted/30" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4 bg-muted/30" />
                    <Skeleton className="h-2 w-1/4 bg-muted/20" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Skeleton */}
          <section className="rounded-4 border border-line bg-card p-[24px] shadow-2 space-y-[20px]">
            <div className="border-b border-dashed border-line pb-[12px]">
              <Skeleton className="h-5 w-40 bg-muted/40" />
            </div>
            
            <div className="grid grid-cols-2 gap-[20px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-2.5 w-12 bg-muted/20" />
                  <Skeleton className="h-4 w-24 bg-muted/30" />
                </div>
              ))}
            </div>

            {/* Grade / Year Full Width */}
            <div className="pt-[16px] border-t border-dashed border-line space-y-3">
              <Skeleton className="h-2.5 w-20 bg-muted/20" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-muted/30" />
                <Skeleton className="h-6 w-20 rounded-full bg-muted/30" />
              </div>
            </div>
          </section>

          {/* Lesson Plan Generation Tool */}
          <section className="bg-card border border-line rounded-4 p-[24px] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-muted/40" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 bg-muted/40" />
                <Skeleton className="h-2.5 w-32 bg-muted/30" />
              </div>
            </div>
            <div className="border-t border-dashed border-line pt-4">
              <Skeleton className="h-10 w-full rounded-full bg-muted/30" />
            </div>
          </section>
        </aside>
      </div>

      {/* Related Strip Skeleton */}
      <section className="mt-16 border-t border-dashed border-line pt-12">
        <Skeleton className="h-7 w-64 mb-10 bg-muted/40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4 bg-card border border-line rounded-5 p-4 shadow-sm">
              <Skeleton className="aspect-square w-full rounded-4 bg-muted/30" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-muted/40" />
                <Skeleton className="h-4 w-[60%] bg-muted/40" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-16 rounded-full bg-muted/20" />
                <Skeleton className="h-5 w-16 rounded-full bg-muted/20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
