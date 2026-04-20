import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function ResourceCardSkeleton() {
  return (
    <div className="relative h-full">
      <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[100px] h-[24px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-30 opacity-90" />

      <Card className="flex h-full flex-col transition-all border-line bg-card rounded-5 p-[16px]">
        <div className="relative aspect-[4/5] bg-paper-2 rounded-4 border border-line-soft overflow-hidden shrink-0">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,oklch(0.88_0.02_75_/_0.5)_10px,oklch(0.88_0.02_75_/_0.5)_11px)] opacity-30 z-10" />
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-[92%]" />
            <Skeleton className="h-6 w-[68%]" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-[82%]" />
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-dashed border-line">
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </Card>
    </div>
  )
}
