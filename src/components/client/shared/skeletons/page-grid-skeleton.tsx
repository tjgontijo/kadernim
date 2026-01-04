import { cn } from '@/lib/utils'

interface PageGridSkeletonProps {
    count?: number
    CardSkeleton: React.ComponentType
    className?: string
    columns?: {
        mobile?: number
        tablet?: number
        desktop?: number
        large?: number
    }
}

export function PageGridSkeleton({
    count = 6,
    CardSkeleton,
    className,
    columns = { mobile: 1, tablet: 2, desktop: 3, large: 4 }
}: PageGridSkeletonProps) {
    return (
        <div className={cn(
            "grid gap-6",
            `grid-cols-${columns.mobile}`,
            columns.tablet && `md:grid-cols-${columns.tablet}`,
            columns.desktop && `lg:grid-cols-${columns.desktop}`,
            columns.large && `xl:grid-cols-${columns.large}`,
            className
        )}>
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}
