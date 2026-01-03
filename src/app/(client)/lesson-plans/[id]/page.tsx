'use client';

import { useParams } from 'next/navigation';
import { PlanViewer } from '@/components/client/lesson-plans/plan-viewer';
import { useLessonPlan } from '@/hooks/use-lesson-plan';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LessonPlanDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: plan, isLoading, error } = useLessonPlan(id);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Skeleton className="h-10 w-48 mb-8" />
                <Card className="border-border/50 shadow-lg">
                    <CardHeader className="p-8 pb-4 space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-3/4" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 space-y-12">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
                <div className="bg-destructive/10 p-6 rounded-full inline-flex items-center justify-center mb-6">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Plano não encontrado</h1>
                <p className="text-muted-foreground mb-8">
                    O plano de aula que você está tentando acessar não existe ou você não tem permissão para vê-lo.
                </p>
                <Button asChild>
                    <Link href="/lesson-plans">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para Meus Planos
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 sm:px-4 pt-1 sm:pt-4 pb-8 sm:pb-12">
            <PlanViewer plan={plan} bnccSkillDescriptions={plan.bnccSkillDescriptions} />
        </div>
    );
}
