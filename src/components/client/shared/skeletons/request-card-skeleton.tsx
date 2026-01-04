import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function RequestCardSkeleton() {
    return (
        <Card className="rounded-[32px] overflow-hidden flex flex-col h-[320px] border-2 border-border/50">
            {/* Header */}
            <div className="p-5 flex justify-between border-b border-border/40 bg-muted/5">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-12" />
            </div>

            {/* Body */}
            <div className="p-6 pb-4 space-y-3 flex-grow">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2.5">
                    <Skeleton className="h-10 w-10 rounded-2xl" />
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="space-y-1 text-right">
                        <Skeleton className="h-6 w-10 ml-auto" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-14 w-14 rounded-[20px]" />
                </div>
            </div>
        </Card>
    )
}
