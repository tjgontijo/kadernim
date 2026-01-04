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

// Ícones por tipo de educação
const EDUCATION_ICONS: Record<string, typeof GraduationCap> = {
  'educacao-infantil': Baby,
  'ensino-fundamental-1': School,
  'ensino-fundamental-2': GraduationCap,
};

/**
 * Question 1: Etapa de Ensino
 *
 * Busca etapas disponíveis e exibe como seleção única
 * Auto-avança após seleção
 */
export function QuestionEducationLevel({ value, onSelect }: QuestionEducationLevelProps) {
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEducationLevels() {
      try {
        const response = await fetch('/api/v1/education-levels');
        if (!response.ok) {
          throw new Error('Erro ao carregar etapas de ensino');
        }
        const data = await response.json();
        if (data.success) {
          setLevels(data.data);
        } else {
          throw new Error(data.error || 'Erro desconhecido');
        }
      } catch (err) {
        console.error('Error fetching education levels:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }

    fetchEducationLevels();
  }, []);

  const handleSelect = (slug: string) => {
    const selected = levels.find((l) => l.slug === slug);
    if (selected) {
      setTimeout(() => {
        onSelect(slug, selected.name);
      }, 400); // Reduzido delay para sensação de rapidez
    }
  };

  return (
    <QuizStep
      title="Para qual etapa de ensino?"
      description="Selecione a etapa que você deseja planejar"
    >
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[24px]" />
          ))
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive font-bold">{error}</p>
          </div>
        ) : (
          levels.map((level) => (
            <QuizCard
              key={level.slug}
              title={level.name}
              icon={EDUCATION_ICONS[level.slug] || GraduationCap}
              selected={value === level.slug}
              onClick={() => handleSelect(level.slug)}
            />
          ))
        )}
      </div>
    </QuizStep>
  );
}
