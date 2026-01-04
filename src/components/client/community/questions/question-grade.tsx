'use client';

import { useEffect, useState } from 'react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
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

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

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

    const quizOptions: QuizOption[] = grades.map(grade => ({
        id: grade.id || grade.slug,
        slug: grade.slug,
        name: grade.name,
        icon: GRADE_ICONS[grade.slug] || Calendar
    }));

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
