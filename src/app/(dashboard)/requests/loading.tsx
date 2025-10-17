// src/app/(dashboard)/requests/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="container py-6 px-4 md:px-6 max-w-6xl">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Requests Table Skeleton */}
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
