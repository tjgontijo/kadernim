'use client';

import { useLessonPlans } from '@/hooks/entities/use-lesson-plans';
import { PlanCard } from './plan-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function PlanList() {
    const { data: plans, isLoading, error } = useLessonPlans();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <Skeleton className="h-40 w-full mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-12 text-center">
                    <p className="text-destructive font-semibold">Ocorreu um erro ao carregar seus planos.</p>
                    <p className="text-muted-foreground mt-2">Por favor, tente novamente mais tarde.</p>
                </CardContent>
            </Card>
        );
    }

    if (!plans || plans.length === 0) {
        return null; // A página principal deve lidar com o empty state se preferir
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
            ))}
        </div>
    );
}
