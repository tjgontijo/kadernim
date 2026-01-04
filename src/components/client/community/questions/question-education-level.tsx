'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Baby, School } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';

interface Option {
    id: string;
    slug: string;
    name: string;
}

interface QuestionEducationLevelProps {
    value?: string;
    onSelect: (id: string, name: string, slug: string) => void;
}

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

// Icons mapping consistent with Lesson Plans
const EDUCATION_ICONS: Record<string, any> = {
    'educacao-infantil': Baby,
    'ensino-fundamental-1': School,
    'ensino-fundamental-2': GraduationCap,
};

export function QuestionEducationLevel({ value, onSelect }: QuestionEducationLevelProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/education-levels')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOptions(data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const quizOptions: QuizOption[] = options.map(opt => ({
        id: opt.id || opt.slug,
        slug: opt.slug,
        name: opt.name,
        icon: EDUCATION_ICONS[opt.slug] || GraduationCap
    }));

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
