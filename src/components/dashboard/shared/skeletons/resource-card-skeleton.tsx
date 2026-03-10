import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export function ResourceCardSkeleton() {
    return (
        <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card rounded-3xl p-3">
            <div className="relative overflow-hidden rounded-2xl bg-muted shrink-0">
                <AspectRatio ratio={1 / 1}>
                    <Skeleton className="h-full w-full" />
                </AspectRatio>
            </div>

            <div className="flex flex-1 flex-col px-3 py-5 pb-2">
                <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />

                    <div className="pt-2 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-border/40">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>
            </div>
        </Card>
    )
}
