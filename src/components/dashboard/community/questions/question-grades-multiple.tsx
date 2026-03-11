'use client';

import { useMemo } from 'react';
import { QuizStep } from '@/components/dashboard/quiz/QuizStep';
import { useGrades } from '@/hooks/taxonomy/use-taxonomy';

interface Grade {
    id: string;
    slug: string;
    name: string;
}

interface QuestionGradesMultipleProps {
    educationLevelSlug: string;
    selectedIds: string[];
    onSelect: (ids: string[], names: string[]) => void;
}

import { QuizChoice, type QuizOption } from '@/components/dashboard/quiz/QuizChoice';

export function QuestionGradesMultiple({
    educationLevelSlug,
    selectedIds,
    onSelect,
}: QuestionGradesMultipleProps) {
    const { data: grades = [], isLoading: loading } = useGrades(educationLevelSlug);

    const quizOptions: QuizOption[] = useMemo(
        () =>
            grades.map((grade: Grade) => ({
                id: grade.id || grade.slug,
                slug: grade.slug,
                name: grade.name,
            })),
        [grades]
    );

    const handleContinue = () => {
        const selectedGrades = grades.filter((g) =>
            selectedIds.includes(g.id || g.slug)
        );
        const names = selectedGrades.map((g) => g.name);
        const ids = selectedGrades.map((g) => g.id || g.slug);
        onSelect(ids, names);
    };

    return (
        <QuizStep
            title="Para quais anos?"
            description="Este material pode ser aplicado a mais de um ano. Selecione todos que se aplicam."
        >
            <QuizChoice
                options={quizOptions}
                value={selectedIds}
                onSelect={(opt) => {
                    const slug = opt.slug;
                    const newIds = selectedIds.includes(slug)
                        ? selectedIds.filter(i => i !== slug)
                        : [...selectedIds, slug];
                    const selectedGrades = grades.filter(g => newIds.includes(g.id || g.slug));
                    onSelect(newIds, selectedGrades.map(g => g.name));
                }}
                multiple={true}
                loading={loading}
                onContinue={handleContinue}
            />
        </QuizStep>
    );
}
