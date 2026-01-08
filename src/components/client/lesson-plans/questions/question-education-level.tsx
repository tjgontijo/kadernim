'use client';

import { GraduationCap, Baby, School } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';
import { useEducationLevels } from '@/hooks/use-taxonomy';

interface QuestionEducationLevelProps {
  value?: string;
  onSelect: (slug: string, name: string) => void;
}

// Ícones por tipo de educação
const EDUCATION_ICONS: Record<string, typeof GraduationCap> = {
  'educacao-infantil': Baby,
  'ensino-fundamental-1': School,
  'ensino-fundamental-2': GraduationCap,
};

export function QuestionEducationLevel({ value, onSelect }: QuestionEducationLevelProps) {
  const { data: levels = [], isLoading, error } = useEducationLevels();

  const quizOptions: QuizOption[] = levels.map(level => ({
    id: level.slug,
    slug: level.slug,
    name: level.name,
    icon: EDUCATION_ICONS[level.slug] || GraduationCap
  }));

  return (
    <QuizStep
      title="Para qual etapa de ensino?"
      description="Selecione a etapa que você deseja planejar"
    >
      {error ? (
        <div className="text-center py-12">
          <p className="text-destructive font-bold">
            {error instanceof Error ? error.message : 'Erro ao carregar etapas de ensino'}
          </p>
        </div>
      ) : (
        <QuizChoice
          options={quizOptions}
          value={value}
          onSelect={(opt) => onSelect(opt.slug, opt.name)}
          loading={isLoading}
          autoAdvance={true}
          onContinue={() => { }} // Auto-advance handles this
        />
      )}
    </QuizStep>
  );
}
