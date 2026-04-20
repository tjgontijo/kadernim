import { Skeleton } from '@/components/ui/skeleton'

export default function AdminBillingLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <Skeleton className="h-10 w-52" />
      <Skeleton className="h-10 w-80 max-w-full" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

