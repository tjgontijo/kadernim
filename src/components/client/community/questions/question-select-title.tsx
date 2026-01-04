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

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';
import { QuizTextInput } from '@/components/client/quiz/QuizTextInput';

export function QuestionSelectTitle({
    description,
    onSelect,
}: QuestionSelectTitleProps) {
    const [titles, setTitles] = useState<TitleOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [customTitle, setCustomTitle] = useState('');

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
            <div className="h-full flex flex-col items-center justify-center space-y-8 py-12">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-black">Criando títulos...</h2>
                    <p className="text-muted-foreground font-medium">
                        Gerando 3 opções de título para você escolher.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <QuizStep
                title="Qual será o título?"
                description={error}
            >
                <QuizTextInput
                    value={customTitle}
                    onChange={setCustomTitle}
                    onContinue={() => onSelect(customTitle)}
                    placeholder="Digite o título do seu pedido..."
                    minLength={5}
                    maxLength={100}
                />
            </QuizStep>
        );
    }

    const quizOptions: QuizOption[] = titles.map(title => ({
        id: title.text,
        slug: title.text,
        name: title.text,
        description: title.label,
        icon: TYPE_ICONS[title.type] || Type
    }));

    return (
        <QuizStep
            title="Qual será o título?"
            description="Escolha o título que melhor representa seu pedido."
        >
            <QuizChoice
                options={quizOptions}
                value=""
                onSelect={(opt) => onSelect(opt.slug)}
                autoAdvance={true}
            />
        </QuizStep>
    );
}
