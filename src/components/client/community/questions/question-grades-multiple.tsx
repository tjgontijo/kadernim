'use client';

import { useEffect, useState } from 'react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
import { QuizAction } from '@/components/client/quiz/QuizAction';
import { Skeleton } from '@/components/ui/skeleton';
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

export function QuestionGradesMultiple({
    educationLevelSlug,
    selectedIds,
    onSelect,
}: QuestionGradesMultipleProps) {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSelected, setCurrentSelected] = useState<string[]>(selectedIds);

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

    const toggleGrade = (id: string) => {
        setCurrentSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleContinue = () => {
        const selectedGrades = grades.filter((g) =>
            currentSelected.includes(g.id || g.slug)
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
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-3">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-[20px]" />
                        ))
                    ) : (
                        grades.map((grade) => {
                            const id = grade.id || grade.slug;
                            return (
                                <QuizCard
                                    key={id}
                                    title={grade.name}
                                    selected={currentSelected.includes(id)}
                                    onClick={() => toggleGrade(id)}
                                    compact
                                />
                            );
                        })
                    )}
                </div>

                <QuizAction
                    label="Continuar"
                    icon={ChevronRight}
                    onClick={handleContinue}
                    disabled={currentSelected.length === 0}
                />
            </div>
        </QuizStep>
    );
}
