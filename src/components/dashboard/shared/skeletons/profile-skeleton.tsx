import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function ProfileSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            {/* Profile Card Skeleton */}
            <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden pt-12 relative">
                <CardContent className="p-8 pt-0 text-center">
                    <div className="flex flex-col items-center mb-12">
                        <Skeleton className="h-40 w-40 rounded-full border-[6px] border-background shadow-2xl" />
                        <Skeleton className="h-10 w-48 mt-8 rounded-xl" />
                        <Skeleton className="h-6 w-24 mt-4 rounded-full" />
                    </div>

                    <div className="space-y-6 max-w-sm mx-auto text-left">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
                                <div className="space-y-2 flex-grow">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-48" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Card Skeleton */}
            <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="flex gap-4 items-center">
                        <Skeleton className="h-12 w-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
            </Card>
        </div>
    )
}
