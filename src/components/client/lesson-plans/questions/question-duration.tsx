'use client';

import { Clock } from 'lucide-react';
import { QuizQuestion } from '../quiz-question';
import { SingleChoice, type ChoiceOption } from '../single-choice';

interface QuestionDurationProps {
  value?: number;
  onSelect: (numberOfClasses: number) => void;
}

const DURATION_OPTIONS: ChoiceOption[] = [
  {
    value: '1',
    label: '1 aula',
    description: '50 minutos',
    icon: Clock,
  },
  {
    value: '2',
    label: '2 aulas',
    description: '100 minutos',
    icon: Clock,
  },
  {
    value: '3',
    label: '3 aulas',
    description: '150 minutos',
    icon: Clock,
  },
];

/**
 * Question 5: Duração
 *
 * Seleção de quantas aulas (1-3)
 */
export function QuestionDuration({ value, onSelect }: QuestionDurationProps) {
  const handleSelect = (selectedValue: string) => {
    const numberOfClasses = parseInt(selectedValue, 10);
    setTimeout(() => {
      onSelect(numberOfClasses);
    }, 600);
  };

  return (
    <QuizQuestion
      title="Quantas aulas?"
      description="Cada aula tem 50 minutos de duração"
    >
      <SingleChoice
        options={DURATION_OPTIONS}
        value={value?.toString()}
        onSelect={handleSelect}
      />
    </QuizQuestion>
  );
}
