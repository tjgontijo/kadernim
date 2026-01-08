'use client';

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
import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';
import { useSubjects } from '@/hooks/use-taxonomy';

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
  'arte': Palette,
  'educacao-fisica': Heart,
  'musica': Music,
  // Campos de experiência (EI)
  'eu-outro-nos': Heart,
  'corpo-gestos-movimentos': Heart,
  'tracos-sons-cores-formas': Palette,
  'escuta-fala-pensamento-imaginacao': BookOpen,
  'espacos-tempos-quantidades-relacoes-transformacoes': Calculator,
};

export function QuestionSubject({
  educationLevelSlug,
  gradeSlug,
  value,
  onSelect,
}: QuestionSubjectProps) {
  const { data: subjects = [], isLoading, error } = useSubjects(educationLevelSlug, gradeSlug, true);

  const isEI = educationLevelSlug === 'educacao-infantil';

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
          <p className="text-destructive font-bold">
            {error instanceof Error ? error.message : 'Erro ao carregar disciplinas/campos'}
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
