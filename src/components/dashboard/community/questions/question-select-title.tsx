'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizStep } from '@/components/dashboard/quiz/QuizStep';
import { Type, FileText, Sparkles, Loader2 } from 'lucide-react';
import { generateCommunityTitleOptionsRequest } from '@/lib/community/api-client';

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

import { QuizChoice, type QuizOption } from '@/components/dashboard/quiz/QuizChoice';
import { QuizTextInput } from '@/components/dashboard/quiz/QuizTextInput';

export function QuestionSelectTitle({
    description,
    onSelect,
}: QuestionSelectTitleProps) {
    const [customTitle, setCustomTitle] = useState('');

    const {
        data: titles = [],
        isLoading: loading,
        error,
    } = useQuery<TitleOption[]>({
        queryKey: ['community-generated-titles', description],
        queryFn: () => generateCommunityTitleOptionsRequest(description),
        retry: false,
    });

    const errorMessage = error instanceof Error
        ? 'Erro ao gerar títulos. Digite um manualmente.'
        : null;

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

    if (errorMessage) {
        return (
            <QuizStep
                title="Qual será o título?"
                description={errorMessage}
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
