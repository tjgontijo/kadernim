// src/app/(dashboard)/resources/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-4xl">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-video rounded-lg mb-6" />

      {/* Description Skeleton */}
      <Card className="p-6 mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Card>

      {/* BNCC Codes Skeleton */}
      <Card className="p-6 mb-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
      </Card>

      {/* Files Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </div>
  )
}
