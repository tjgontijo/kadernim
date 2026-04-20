import { Skeleton } from '@/components/ui/skeleton'

export function ResourceDetailPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] w-full px-4 sm:px-8 py-8 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-[48px] items-start tracking-tight">
        <div className="space-y-6">
          <section className="bg-card border border-line rounded-5 p-[16px] relative shadow-2">
            <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
            <div className="aspect-[4/5] bg-paper-2 rounded-4 border border-line-soft overflow-hidden mb-[12px] relative w-full">
              <Skeleton className="h-full w-full rounded-none" />
            </div>
            <div className="flex gap-[10px] overflow-x-auto pb-1 scrollbar-none">
              <Skeleton className="w-[72px] h-[54px] rounded-2 border border-line-soft shrink-0" />
              <Skeleton className="w-[72px] h-[54px] rounded-2 border border-line-soft shrink-0" />
              <Skeleton className="w-[72px] h-[54px] rounded-2 border border-line-soft shrink-0" />
              <Skeleton className="w-[72px] h-[54px] rounded-2 border border-line-soft shrink-0" />
            </div>
          </section>

          <section className="rounded-5 border border-line bg-card p-5 space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[84%]" />
          </section>

          <section className="rounded-5 border border-line bg-card p-5 space-y-4">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </section>

          <section className="rounded-5 border border-line bg-card p-5 space-y-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </section>

          <section className="rounded-5 border border-line bg-card p-5 space-y-4">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </section>
        </div>

        <aside className="sticky top-[84px] flex flex-col gap-[20px]">
          <section className="rounded-5 border border-line bg-card p-5 space-y-4">
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </section>

          <section className="rounded-5 border border-line bg-card p-5 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </section>

          <section className="rounded-5 border border-line bg-card p-5 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </section>
        </aside>
      </div>

      <section className="mt-10 sm:mt-12">
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-4" />
          ))}
        </div>
      </section>
    </div>
  )
}
