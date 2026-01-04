'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Baby, School } from 'lucide-react';
import { QuizStep } from '@/components/quiz/QuizStep';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Option {
    slug: string;
    name: string;
}

interface QuestionEducationLevelProps {
    value?: string;
    onSelect: (slug: string, name: string) => void;
}

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

    return (
        <QuizStep
            title="Qual é a etapa de ensino?"
            description="Selecione para qual nível de alunos devemos produzir este material."
        >
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-[24px]" />
                    ))
                ) : (
                    options.map((option) => (
                        <QuizCard
                            key={option.slug}
                            title={option.name}
                            icon={EDUCATION_ICONS[option.slug] || GraduationCap}
                            selected={value === option.slug}
                            onClick={() => onSelect(option.slug, option.name)}
                        />
                    ))
                )}
            </div>
        </QuizStep>
    );
}
