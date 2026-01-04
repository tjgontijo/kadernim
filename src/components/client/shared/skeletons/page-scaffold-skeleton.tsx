import { Skeleton } from '@/components/ui/skeleton'
import { PageScaffold } from '@/components/client/shared/page-scaffold'

interface PageScaffoldSkeletonProps {
    showHighlight?: boolean
    cardCount?: number
    CardSkeleton: React.ComponentType
    columns?: {
        mobile?: number
        tablet?: number
        desktop?: number
        large?: number
    }
}

export function PageScaffoldSkeleton({
    showHighlight = true,
    cardCount = 6,
    CardSkeleton,
    columns
}: PageScaffoldSkeletonProps) {
    return (
        <PageScaffold>
            {/* Header Skeleton */}
            <PageScaffold.Header
                title={<Skeleton className="h-10 w-48 sm:w-64" />}
                action={<Skeleton className="h-10 sm:h-12 w-32 sm:w-40 rounded-2xl" />}
            />

            {/* Highlight Skeleton */}
            {showHighlight && (
                <PageScaffold.Highlight>
                    <Skeleton className="h-20 sm:h-24 w-full rounded-2xl" />
                </PageScaffold.Highlight>
            )}

            {/* Controls Skeleton */}
            <PageScaffold.Controls>
                <div className="flex-1">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
            </PageScaffold.Controls>

            {/* Content Skeleton */}
            <div className="px-4 sm:px-0 mt-6">
                <div className={cn(
                    "grid gap-6",
                    "grid-cols-1",
                    "md:grid-cols-2",
                    "lg:grid-cols-3",
                    columns?.large && "xl:grid-cols-4"
                )}>
                    {Array.from({ length: cardCount }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </PageScaffold>
    )
}

// Helper to avoid importing cn everywhere if not needed
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
