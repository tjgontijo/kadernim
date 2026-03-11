'use client';

import { useMemo } from 'react';
import { QuizStep } from '@/components/dashboard/quiz/QuizStep';
import { Calendar, Baby, Users } from 'lucide-react';
import { useGrades } from '@/hooks/taxonomy/use-taxonomy';

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

import { QuizChoice, type QuizOption } from '@/components/dashboard/quiz/QuizChoice';

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
    const isEI = educationLevelSlug === 'educacao-infantil';
    const { data: grades = [], isLoading: loading } = useGrades(educationLevelSlug);

    const quizOptions: QuizOption[] = useMemo(() => grades.map(grade => ({
        id: grade.id || grade.slug,
        slug: grade.slug,
        name: grade.name,
        icon: GRADE_ICONS[grade.slug] || Calendar
    })), [grades]);

    return (
        <QuizStep
            title={isEI ? 'Qual faixa etária?' : 'Qual ano/série?'}
            description={isEI ? 'Selecione a faixa etária das crianças.' : 'Selecione o ano escolar.'}
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
