// src/app/(dashboard)/feed/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="container py-6 px-4 md:px-6 max-w-4xl">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Feed Items Skeleton */}
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                
                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
