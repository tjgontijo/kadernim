'use client';

import { Clock } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';

interface QuestionDurationProps {
  value?: number;
  onSelect: (numberOfClasses: number) => void;
}


import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

const DURATION_OPTIONS: QuizOption[] = [
  {
    id: '1',
    slug: '1',
    name: '1 aula',
    description: '50 minutos',
    icon: Clock
  },
  {
    id: '2',
    slug: '2',
    name: '2 aulas',
    description: '100 minutos',
    icon: Clock
  },
  {
    id: '3',
    slug: '3',
    name: '3 aulas',
    description: '150 minutos',
    icon: Clock
  },
];

export function QuestionDuration({ value, onSelect }: QuestionDurationProps) {
  return (
    <QuizStep
      title="Quantas aulas?"
      description="Cada aula tem aproximadamente 50 minutos."
    >
      <QuizChoice
        options={DURATION_OPTIONS}
        value={value?.toString()}
        onSelect={(opt) => onSelect(parseInt(opt.slug, 10))}
        autoAdvance={true}
      />
    </QuizStep>
  );
}
