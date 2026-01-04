'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Baby, School } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';

interface EducationLevel {
  slug: string;
  name: string;
  order: number;
}

interface QuestionEducationLevelProps {
  value?: string;
  onSelect: (slug: string, name: string) => void;
}

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

// Ícones por tipo de educação
const EDUCATION_ICONS: Record<string, typeof GraduationCap> = {
  'educacao-infantil': Baby,
  'ensino-fundamental-1': School,
  'ensino-fundamental-2': GraduationCap,
};

export function QuestionEducationLevel({ value, onSelect }: QuestionEducationLevelProps) {
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEducationLevels() {
      try {
        const response = await fetch('/api/v1/education-levels');
        if (!response.ok) throw new Error('Erro ao carregar etapas de ensino');
        const data = await response.json();
        if (data.success) setLevels(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    fetchEducationLevels();
  }, []);

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
          <p className="text-destructive font-bold">{error}</p>
        </div>
      ) : (
        <QuizChoice
          options={quizOptions}
          value={value}
          onSelect={(opt) => onSelect(opt.slug, opt.name)}
          loading={loading}
          autoAdvance={true}
          onContinue={() => { }} // Auto-advance handles this
        />
      )}
    </QuizStep>
  );
}
