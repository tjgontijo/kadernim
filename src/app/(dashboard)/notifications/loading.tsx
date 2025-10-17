// src/app/(dashboard)/notifications/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="container py-6 px-4 md:px-6 max-w-4xl">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Notifications List Skeleton */}
      <div className="space-y-3">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              
              <div className="flex-1 space-y-2">
                {/* Title */}
                <Skeleton className="h-5 w-3/4" />
                
                {/* Message */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                
                {/* Time */}
                <Skeleton className="h-3 w-24" />
              </div>
              
              {/* Badge/Status */}
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2 mt-6">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  )
}
