import { Skeleton } from '@/components/ui/skeleton'

export default function BillingLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Skeleton className="h-10 w-48" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 lg:col-span-2 rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-5 w-72" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  )
}

