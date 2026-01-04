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
            <div className="h-full flex flex-col items-center justify-center space-y-6">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <h2 className="text-2xl font-black text-center">IA estruturando sua ideia...</h2>
                <p className="text-muted-foreground text-center px-8">
                    Estamos organizando o formato, usabilidade e pedagogia do seu pedido.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <QuizStep
                title="Não foi possível refinar"
                description={error}
            >
                <button
                    onClick={() => onSelect(rawDescription)}
                    className="w-full p-6 rounded-[24px] border-2 border-primary bg-primary/5 text-left"
                >
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
                        Continuar com meu texto
                    </p>
                    <p className="font-bold text-foreground line-clamp-3">
                        "{rawDescription}"
                    </p>
                </button>
            </QuizStep>
        );
    }

    return (
        <QuizStep
            title="Como quer seu material?"
            description="Escolha a estrutura que melhor descreve seu pedido."
        >
            <div className="flex flex-col gap-4">
                {refinements.map((ref, index) => (
                    <QuizCard
                        key={index}
                        title={ref.label}
                        description={ref.text}
                        icon={TYPE_ICONS[ref.type] || Layout}
                        onClick={() => onSelect(ref.text)}
                    />
                ))}

                <button
                    onClick={() => onSelect(rawDescription)}
                    className="p-6 rounded-[24px] border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-left group mt-4"
                >
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 group-hover:text-primary/50 transition-colors">
                            Manter meu texto original
                        </p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-all" />
                    </div>
                    <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-3 italic">
                        "{rawDescription}"
                    </p>
                </button>
            </div>
        </QuizStep>
    );
}
