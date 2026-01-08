'use client';

import { Users } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';
import { useGrades } from '@/hooks/use-taxonomy';

interface QuestionGradeProps {
  educationLevelSlug: string;
  value?: string;
  onSelect: (slug: string, name: string) => void;
}

export function QuestionGrade({ educationLevelSlug, value, onSelect }: QuestionGradeProps) {
  const { data: grades = [], isLoading, error } = useGrades(educationLevelSlug);
  const isEI = educationLevelSlug === 'educacao-infantil';

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
          <p className="text-destructive font-bold">
            {error instanceof Error ? error.message : 'Erro ao carregar anos/faixas etárias'}
          </p>
        </div>
      ) : (
        <QuizChoice
          options={quizOptions}
          value={value}
          onSelect={(opt) => onSelect(opt.slug, opt.name)}
          loading={isLoading}
          autoAdvance={true}
        />
      )}
    </QuizStep>
  );
}
