'use client';

import { useEffect, useState } from 'react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Baby, Users } from 'lucide-react';

interface Grade {
    id: string;
    slug: string;
    name: string;
}

interface QuestionGradeProps {
    educationLevelSlug: string;
    value?: string;
    onSelect: (id: string, name: string, slug: string) => void;
}

// Ícones por tipo de grade
const GRADE_ICONS: Record<string, any> = {
    'bebes': Baby,
    'criancas-bem-pequenas': Baby,
    'criancas-pequenas': Users,
};

export function QuestionGrade({
    educationLevelSlug,
    value,
    onSelect,
}: QuestionGradeProps) {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

    const isEI = educationLevelSlug === 'educacao-infantil';

    useEffect(() => {
        async function fetchGrades() {
            try {
                setLoading(true);
                const response = await fetch(`/api/v1/grades?educationLevelSlug=${educationLevelSlug}`);
                const data = await response.json();
                if (data.success) {
                    setGrades(data.data);
                }
            } catch (err) {
                console.error('Error fetching grades:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchGrades();
    }, [educationLevelSlug]);

    const handleSelect = (grade: Grade) => {
        setTimeout(() => {
            onSelect(grade.id || grade.slug, grade.name, grade.slug);
        }, 400);
    };

    return (
        <QuizStep
            title={isEI ? 'Qual faixa etária?' : 'Qual ano/série?'}
            description={isEI ? 'Selecione a faixa etária das crianças.' : 'Selecione o ano escolar.'}
        >
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-[24px]" />
                    ))
                ) : (
                    grades.map((grade) => (
                        <QuizCard
                            key={grade.slug}
                            title={grade.name}
                            icon={GRADE_ICONS[grade.slug] || Calendar}
                            selected={value === (grade.id || grade.slug)}
                            onClick={() => handleSelect(grade)}
                        />
                    ))
                )}
            </div>
        </QuizStep>
    );
}
