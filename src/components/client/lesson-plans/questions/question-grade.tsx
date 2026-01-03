'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { QuizQuestion } from '../quiz-question';
import { SingleChoice, type ChoiceOption } from '../single-choice';
import { Spinner } from '@/components/ui/spinner';

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

/**
 * Question 2: Ano/Faixa Etária
 *
 * Bifurca baseado na etapa de ensino:
 * - EI: Mostra faixas etárias
 * - EF: Mostra anos escolares
 */
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
      }, 600);
    }
  };

  if (loading) {
    return (
      <QuizQuestion title={isEI ? 'Qual faixa etária?' : 'Para qual ano?'}>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </QuizQuestion>
    );
  }

  if (error) {
    return (
      <QuizQuestion title={isEI ? 'Qual faixa etária?' : 'Para qual ano?'}>
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </QuizQuestion>
    );
  }

  const options: ChoiceOption[] = grades.map((grade) => ({
    value: grade.slug,
    label: grade.name,
    icon: Users,
  }));

  return (
    <QuizQuestion
      title={isEI ? 'Qual faixa etária?' : 'Para qual ano?'}
      description={
        isEI
          ? 'Selecione a faixa etária das crianças'
          : 'Selecione o ano escolar para este plano'
      }
    >
      <SingleChoice options={options} value={value} onSelect={handleSelect} />
    </QuizQuestion>
  );
}
