'use client';

import { useState, useEffect } from 'react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
import { Layout, Users, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

export function QuestionRefineDescription({
    rawDescription,
    educationLevelName,
    subjectName,
    gradeNames,
    onSelect,
}: QuestionRefineDescriptionProps) {
    const [refinements, setRefinements] = useState<Refinement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRefinement() {
            try {
                setLoading(true);
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
                if (data.success) {
                    setRefinements(data.data.refined);
                } else {
                    throw new Error(data.error);
                }
            } catch (err) {
                console.error('Error refining description:', err);
                setError('Erro ao gerar sugestões. Você pode prosseguir com a sua versão original.');
                toast.error('Erro na conexão com IA');
            } finally {
                setLoading(false);
            }
        }
        fetchRefinement();
    }, [rawDescription, educationLevelName, subjectName, gradeNames]);

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
            description={error || "Escolha a estrutura que melhor descreve seu pedido."}
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
