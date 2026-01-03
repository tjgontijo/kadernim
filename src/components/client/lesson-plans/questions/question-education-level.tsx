'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Baby, School } from 'lucide-react';
import { QuizQuestion } from '../quiz-question';
import { SingleChoice, type ChoiceOption } from '../single-choice';
import { Spinner } from '@/components/ui/spinner';

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
      // Auto-avança após seleção
      setTimeout(() => {
        onSelect(slug, selected.name);
      }, 600);
    }
  };

  // Estado de loading
  if (loading) {
    return (
      <QuizQuestion title="Para qual etapa de ensino?">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </QuizQuestion>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <QuizQuestion title="Para qual etapa de ensino?">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </QuizQuestion>
    );
  }

  // Mapear para opções do SingleChoice
  const options: ChoiceOption[] = levels.map((level) => ({
    value: level.slug,
    label: level.name,
    icon: EDUCATION_ICONS[level.slug],
  }));

  return (
    <QuizQuestion
      title="Para qual etapa de ensino?"
      description="Selecione a etapa que você deseja planejar"
    >
      <SingleChoice options={options} value={value} onSelect={handleSelect} />
    </QuizQuestion>
  );
}
