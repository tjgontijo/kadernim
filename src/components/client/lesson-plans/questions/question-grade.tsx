'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { QuizStep } from '@/components/quiz/QuizStep';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Grade {
  slug: string;
  name: string;
  order: number;
  educationLevelSlug: string;
}

interface QuestionGradeProps {
  educationLevelSlug: string;
  value?: string;
  onSelect: (slug: string, name: string) => void;
}

export function QuestionGrade({ educationLevelSlug, value, onSelect }: QuestionGradeProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEI = educationLevelSlug === 'educacao-infantil';

  useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await fetch(`/api/v1/grades?educationLevelSlug=${educationLevelSlug}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar anos/faixas etárias');
        }
        const data = await response.json();
        if (data.success) {
          setGrades(data.data);
        } else {
          throw new Error(data.error || 'Erro desconhecido');
        }
      } catch (err) {
        console.error('Error fetching grades:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [educationLevelSlug]);

  const handleSelect = (slug: string) => {
    const selected = grades.find((g) => g.slug === slug);
    if (selected) {
      setTimeout(() => {
        onSelect(slug, selected.name);
      }, 400);
    }
  };

  return (
    <QuizStep
      title={isEI ? 'Qual faixa etária?' : 'Para qual ano?'}
      description={
        isEI
          ? 'Selecione a faixa etária das crianças'
          : 'Selecione o ano escolar para este plano'
      }
    >
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[24px]" />
          ))
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive font-bold">{error}</p>
          </div>
        ) : (
          grades.map((grade) => (
            <QuizCard
              key={grade.slug}
              title={grade.name}
              icon={Users}
              selected={value === grade.slug}
              onClick={() => handleSelect(grade.slug)}
            />
          ))
        )}
      </div>
    </QuizStep>
  );
}
