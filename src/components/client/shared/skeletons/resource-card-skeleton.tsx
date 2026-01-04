import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export function ResourceCardSkeleton() {
    return (
        <Card className="group overflow-hidden border-border/50">
            <AspectRatio ratio={1 / 1} className="bg-muted animate-pulse relative">
                <Skeleton className="absolute left-2 top-2 h-6 w-16 rounded-full" />
            </AspectRatio>

            <div className="flex min-h-[160px] flex-col px-6 pb-6 pt-6 gap-3">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>

                <div className="h-px bg-border/20 w-full" />

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </div>
        </Card>
    )
}
