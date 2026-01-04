'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Baby, School } from 'lucide-react';
import { QuizStep } from '@/components/quiz/QuizStep';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Option {
    id: string;
    slug: string;
    name: string;
}

interface QuestionEducationLevelProps {
    value?: string;
    onSelect: (id: string, name: string, slug: string) => void;
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

    const handleSelect = (option: Option) => {
        setTimeout(() => {
            onSelect(option.id || option.slug, option.name, option.slug);
        }, 400);
    };

    return (
        <QuizStep
            title="Qual é a etapa de ensino?"
            description="Selecione para qual etapa devemos produzir este material."
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
                            selected={value === (option.id || option.slug)}
                            onClick={() => handleSelect(option)}
                        />
                    ))
                )}
            </div>
        </QuizStep>
    );
}
