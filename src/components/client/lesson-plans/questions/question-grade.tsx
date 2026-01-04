'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
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

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

export function QuestionGrade({ educationLevelSlug, value, onSelect }: QuestionGradeProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEI = educationLevelSlug === 'educacao-infantil';

  useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await fetch(`/api/v1/grades?educationLevelSlug=${educationLevelSlug}`);
        if (!response.ok) throw new Error('Erro ao carregar anos/faixas etárias');
        const data = await response.json();
        if (data.success) setGrades(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, [educationLevelSlug]);

  const quizOptions: QuizOption[] = grades.map(grade => ({
    id: grade.slug,
    slug: grade.slug,
    name: grade.name,
    icon: Users
  }));

  return (
    <QuizStep
      title={isEI ? 'Qual faixa etária?' : 'Para qual ano?'}
      description={
        isEI
          ? 'Selecione a faixa etária das crianças'
          : 'Selecione o ano escolar para este plano'
      }
    >
      {error ? (
        <div className="text-center py-12">
          <p className="text-destructive font-bold">{error}</p>
        </div>
      ) : (
        <QuizChoice
          options={quizOptions}
          value={value}
          onSelect={(opt) => onSelect(opt.slug, opt.name)}
          loading={loading}
          autoAdvance={true}
        />
      )}
    </QuizStep>
  );
}
