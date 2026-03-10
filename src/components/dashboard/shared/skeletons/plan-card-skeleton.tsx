import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function PlanCardSkeleton() {
    return (
        <Card className="rounded-2xl p-6 h-56 flex flex-col justify-between border border-border/50">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                <div className="space-y-2.5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20" />
            </div>
        </Card>
    )
}
