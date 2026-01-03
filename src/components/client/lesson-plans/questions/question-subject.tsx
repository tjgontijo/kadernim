'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calculator,
  Microscope,
  Globe,
  Scroll,
  Palette,
  Music,
  Heart,
} from 'lucide-react';
import { QuizQuestion } from '../quiz-question';
import { SingleChoice, type ChoiceOption } from '../single-choice';
import { Spinner } from '@/components/ui/spinner';

interface Subject {
  slug: string;
  name: string;
}

interface QuestionSubjectProps {
  educationLevelSlug: string;
  gradeSlug: string;
  value?: string;
  onSelect: (slug: string, name: string) => void;
}

// Ícones por disciplina/campo
const SUBJECT_ICONS: Record<string, typeof BookOpen> = {
  'lingua-portuguesa': BookOpen,
  'matematica': Calculator,
  'ciencias': Microscope,
  'geografia': Globe,
  'historia': Scroll,
  'artes': Palette,
  'educacao-fisica': Heart,
  'musica': Music,
  // Campos de experiência (EI)
  'o-eu-o-outro-e-o-nos': Heart,
  'corpo-gestos-e-movimentos': Heart,
  'tracos-sons-cores-e-formas': Palette,
  'escuta-fala-pensamento-e-imaginacao': BookOpen,
  'espacos-tempos-quantidades-relacoes-e-transformacoes': Calculator,
};

/**
 * Question 3: Disciplina/Campo de Experiência
 *
 * Bifurca baseado na etapa:
 * - EI: Campos de experiência
 * - EF: Disciplinas
 */
export function QuestionSubject({
  educationLevelSlug,
  gradeSlug,
  value,
  onSelect,
}: QuestionSubjectProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEI = educationLevelSlug === 'educacao-infantil';

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch(
          `/api/v1/subjects?educationLevelSlug=${educationLevelSlug}&gradeSlug=${gradeSlug}`
        );
        if (!response.ok) {
          throw new Error('Erro ao carregar disciplinas/campos');
        }
        const data = await response.json();
        if (data.success) {
          setSubjects(data.data);
        } else {
          throw new Error(data.error || 'Erro desconhecido');
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [educationLevelSlug, gradeSlug]);

  const handleSelect = (slug: string) => {
    const selected = subjects.find((s) => s.slug === slug);
    if (selected) {
      setTimeout(() => {
        onSelect(slug, selected.name);
      }, 600);
    }
  };

  if (loading) {
    return (
      <QuizQuestion title={isEI ? 'Qual campo de experiência?' : 'Qual componente curricular?'}>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </QuizQuestion>
    );
  }

  if (error) {
    return (
      <QuizQuestion title={isEI ? 'Qual campo de experiência?' : 'Qual componente curricular?'}>
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </QuizQuestion>
    );
  }

  const options: ChoiceOption[] = subjects.map((subject) => ({
    value: subject.slug,
    label: subject.name,
    icon: SUBJECT_ICONS[subject.slug] || BookOpen,
  }));

  return (
    <QuizQuestion
      title={isEI ? 'Qual campo de experiência?' : 'Qual componente curricular?'}
      description={
        isEI
          ? 'Selecione o campo de experiência BNCC'
          : 'Selecione o componente curricular para este plano'
      }
    >
      <SingleChoice options={options} value={value} onSelect={handleSelect} />
    </QuizQuestion>
  );
}
