'use client';

import { useState, useEffect } from 'react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
import { Type, FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TitleOption {
    type: string;
    label: string;
    text: string;
}

interface QuestionSelectTitleProps {
    description: string;
    onSelect: (title: string) => void;
}

const TYPE_ICONS: Record<string, any> = {
    short: Type,
    descriptive: FileText,
    creative: Sparkles,
};

export function QuestionSelectTitle({
    description,
    onSelect,
}: QuestionSelectTitleProps) {
    const [titles, setTitles] = useState<TitleOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTitles() {
            try {
                setLoading(true);
                const response = await fetch('/api/v1/community/generate-title', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description }),
                });
                const data = await response.json();
                if (data.success) {
                    setTitles(data.data.titles);
                } else {
                    throw new Error(data.error);
                }
            } catch (err) {
                console.error('Error generating titles:', err);
                setError('Erro ao gerar títulos. Digite um manualmente.');
                toast.error('Erro na conexão com IA');
            } finally {
                setLoading(false);
            }
        }
        fetchTitles();
    }, [description]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <h2 className="text-2xl font-black text-center">Criando títulos...</h2>
                <p className="text-muted-foreground text-center px-8">
                    Gerando 3 opções de título para você escolher.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <QuizStep
                title="Qual será o título?"
                description={error}
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        className="w-full h-14 bg-muted/50 border-2 border-border/50 rounded-2xl px-5 font-bold focus:border-primary focus:ring-0 transition-all outline-none"
                        placeholder="Digite o título do seu pedido..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.length >= 5) {
                                onSelect(e.currentTarget.value);
                            }
                        }}
                    />
                </div>
            </QuizStep>
        );
    }

    return (
        <QuizStep
            title="Qual será o título?"
            description="Escolha o título que melhor representa seu pedido."
        >
            <div className="flex flex-col gap-4">
                {titles.map((title, index) => (
                    <QuizCard
                        key={index}
                        title={title.text}
                        description={title.label}
                        icon={TYPE_ICONS[title.type] || Type}
                        onClick={() => onSelect(title.text)}
                    />
                ))}
            </div>
        </QuizStep>
    );
}
