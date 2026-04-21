import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function InfoRowSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-3 bg-paper-2" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20 bg-paper-2" />
        <Skeleton className="h-5 w-52 bg-paper-2" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 px-4 sm:px-0 pt-8 pb-16">
      <Card className="relative overflow-hidden rounded-4 border border-line bg-card shadow-1 paper-grain pt-10">
        <CardContent className="p-8 pt-2">
          <div className="mb-10 flex flex-col items-center">
            <div className="relative">
              <Skeleton className="h-40 w-40 !rounded-full border-[6px] border-line bg-paper-2 shadow-2" />
              <Skeleton className="absolute bottom-2 right-2 h-8 w-8 !rounded-full border border-line bg-paper" />
            </div>
            <Skeleton className="mt-6 h-11 w-64 rounded-2 bg-paper-2" />
            <Skeleton className="mt-3 h-6 w-28 !rounded-full bg-paper-2" />
            <Skeleton className="mt-3 h-3 w-48 rounded-2 bg-paper-2" />
          </div>

          <div className="space-y-6">
            <InfoRowSkeleton />
            <InfoRowSkeleton />
            <InfoRowSkeleton />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-4 border border-line bg-card shadow-1">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-3 bg-paper-2" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 bg-paper-2" />
              <Skeleton className="h-4 w-56 bg-paper-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-5">
          <div className="space-y-3">
            <Skeleton className="h-6 w-36 !rounded-full bg-paper-2" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 w-full rounded-3 bg-paper-2" />
              <Skeleton className="h-20 w-full rounded-3 bg-paper-2" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-3 bg-paper-2" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-4 border border-line bg-card shadow-1">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-3 bg-paper-2" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-28 bg-paper-2" />
              <Skeleton className="h-4 w-52 bg-paper-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          <Skeleton className="h-14 w-full rounded-3 bg-paper-2" />
          <Skeleton className="h-14 w-full rounded-3 bg-paper-2" />
        </CardContent>
      </Card>
    </div>
  )
}
