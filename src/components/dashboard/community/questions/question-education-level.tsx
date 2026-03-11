'use client';

import { useMemo } from 'react';
import { GraduationCap, Baby, School } from 'lucide-react';
import { QuizStep } from '@/components/dashboard/quiz/QuizStep';
import { useEducationLevels } from '@/hooks/taxonomy/use-taxonomy';

interface Option {
    id: string;
    slug: string;
    name: string;
}

interface QuestionEducationLevelProps {
    value?: string;
    onSelect: (id: string, name: string, slug: string) => void;
}

import { QuizChoice, type QuizOption } from '@/components/dashboard/quiz/QuizChoice';

// Icons mapping consistent with Lesson Plans
const EDUCATION_ICONS: Record<string, any> = {
    'educacao-infantil': Baby,
    'ensino-fundamental-1': School,
    'ensino-fundamental-2': GraduationCap,
};

export function QuestionEducationLevel({ value, onSelect }: QuestionEducationLevelProps) {
    const { data: options = [], isLoading: loading } = useEducationLevels();

    const quizOptions: QuizOption[] = useMemo(() => options.map(opt => ({
        id: opt.id || opt.slug,
        slug: opt.slug,
        name: opt.name,
        icon: EDUCATION_ICONS[opt.slug] || GraduationCap
    })), [options]);

    return (
        <QuizStep
            title="Qual é a etapa de ensino?"
            description="Selecione para qual etapa devemos produzir este material."
        >
            <QuizChoice
                options={quizOptions}
                value={value}
                onSelect={(opt) => onSelect(opt.id, opt.name, opt.slug)}
                loading={loading}
                autoAdvance={true}
            />
        </QuizStep>
    );
}
