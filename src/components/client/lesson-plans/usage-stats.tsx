'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLessonPlanUsage } from '@/hooks/entities/use-lesson-plans';
import { cn } from '@/lib/utils/index';

export function UsageStats() {
    const { data, isLoading, error } = useLessonPlanUsage();

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-3 w-48" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) return null;

    const { used, limit, remaining, percentage } = data;
    const isCloseToLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                        Uso Mensal
                    </h3>
                    <span className={cn(
                        "text-sm font-medium",
                        isAtLimit ? "text-destructive" : isCloseToLimit ? "text-orange-500" : "text-primary"
                    )}>
                        {used} de {limit} planos
                    </span>
                </div>

                <Progress
                    value={percentage}
                    className="h-2 mb-3"
                    indicatorClassName={cn(
                        isAtLimit ? "bg-destructive" : isCloseToLimit ? "bg-orange-500" : "bg-primary"
                    )}
                />

                <p className="text-sm text-muted-foreground">
                    {isAtLimit ? (
                        "Você atingiu seu limite mensal. Novos planos estarão disponíveis no próximo mês."
                    ) : (
                        `Você ainda pode criar ${remaining} ${remaining === 1 ? 'plano' : 'planos'} este mês.`
                    )}
                </p>
            </CardContent>
        </Card>
    );
}
