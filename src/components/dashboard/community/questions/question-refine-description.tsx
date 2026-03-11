'use client';

import { useQuery } from '@tanstack/react-query';
import { QuizStep } from '@/components/dashboard/quiz/QuizStep';
import { Layout, Users, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

interface Refinement {
    type: string;
    label: string;
    text: string;
}

interface QuestionRefineDescriptionProps {
    rawDescription: string;
    educationLevelName: string;
    subjectName: string;
    gradeNames: string[];
    onSelect: (description: string) => void;
}

const TYPE_ICONS: Record<string, any> = {
    format: Layout,
    usability: Users,
    pedagogy: GraduationCap,
};

import { QuizChoice, type QuizOption } from '@/components/dashboard/quiz/QuizChoice';

export function QuestionRefineDescription({
    rawDescription,
    educationLevelName,
    subjectName,
    gradeNames,
    onSelect,
}: QuestionRefineDescriptionProps) {
    const {
        data: refinements = [],
        isLoading: loading,
        error,
    } = useQuery<Refinement[]>({
        queryKey: [
            'community-refined-description',
            rawDescription,
            educationLevelName,
            subjectName,
            gradeNames.join('|'),
        ],
        queryFn: async () => {
            const response = await fetch('/api/v1/community/refine-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rawDescription,
                    educationLevelName,
                    subjectName,
                    gradeNames,
                }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erro ao gerar sugestões.');
            }

            return data.data.refined;
        },
        retry: false,
    });

    const errorMessage = error instanceof Error
        ? 'Erro ao gerar sugestões. Você pode prosseguir com a sua versão original.'
        : null;

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-8 py-12">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-black">Estruturando ideias...</h2>
                    <p className="text-muted-foreground font-medium">
                        Organizando o formato e a pedagogia do seu pedido.
                    </p>
                </div>
            </div>
        );
    }

    const quizOptions: QuizOption[] = [
        ...refinements.map(ref => ({
            id: ref.text,
            slug: ref.text,
            name: ref.label,
            description: ref.text,
            icon: TYPE_ICONS[ref.type] || Layout
        })),
        {
            id: 'original',
            slug: 'original',
            name: 'Manter meu texto original',
            description: rawDescription,
            icon: ArrowRight
        }
    ];

    return (
        <QuizStep
            title="Como quer seu material?"
            description={errorMessage || "Escolha a estrutura que melhor descreve seu pedido."}
        >
            <QuizChoice
                options={quizOptions}
                value="" // no selection by default
                onSelect={(opt) => onSelect(opt.slug === 'original' ? rawDescription : opt.slug)}
                autoAdvance={true}
            />
        </QuizStep>
    );
}
