'use client';

import { useEffect, useState } from 'react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizAction } from '@/components/client/quiz/QuizAction';
import { ChevronRight } from 'lucide-react';

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

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

export function QuestionGradesMultiple({
    educationLevelSlug,
    selectedIds,
    onSelect,
}: QuestionGradesMultipleProps) {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

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
    }));

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
