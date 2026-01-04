'use client';

import { Clock } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';

interface QuestionDurationProps {
  value?: number;
  onSelect: (numberOfClasses: number) => void;
}

const DURATION_OPTIONS = [
  {
    value: '1',
    label: '1 aula',
    description: '50 minutos',
  },
  {
    value: '2',
    label: '2 aulas',
    description: '100 minutos',
  },
  {
    value: '3',
    label: '3 aulas',
    description: '150 minutos',
  },
];

export function QuestionDuration({ value, onSelect }: QuestionDurationProps) {
  const handleSelect = (selectedValue: string) => {
    const numberOfClasses = parseInt(selectedValue, 10);
    setTimeout(() => {
      onSelect(numberOfClasses);
    }, 400);
  };

  return (
    <QuizStep
      title="Quantas aulas?"
      description="Cada aula tem aproximadamente 50 minutos."
    >
      <div className="grid grid-cols-1 gap-4">
        {DURATION_OPTIONS.map((option) => (
          <QuizCard
            key={option.value}
            title={option.label}
            description={option.description}
            icon={Clock}
            selected={value?.toString() === option.value}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </div>
    </QuizStep>
  );
}
