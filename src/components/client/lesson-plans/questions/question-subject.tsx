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
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';

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

import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';

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
        if (!response.ok) throw new Error('Erro ao carregar disciplinas/campos');
        const data = await response.json();
        if (data.success) setSubjects(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    fetchSubjects();
  }, [educationLevelSlug, gradeSlug]);

  const quizOptions: QuizOption[] = subjects.map(subject => ({
    id: subject.slug,
    slug: subject.slug,
    name: subject.name,
    icon: SUBJECT_ICONS[subject.slug] || BookOpen
  }));

  return (
    <QuizStep
      title={isEI ? 'Qual campo de experiência?' : 'Qual componente curricular?'}
      description={
        isEI
          ? 'Selecione o campo de experiência BNCC'
          : 'Selecione o componente curricular para este plano'
      }
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
        />
      )}
    </QuizStep>
  );
}
