'use client';

import { useMemo } from 'react';
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
import { QuizStep } from '@/components/dashboard/quiz/QuizStep';
import { useSubjects } from '@/hooks/taxonomy/use-taxonomy';

interface Subject {
    id: string;
    slug: string;
    name: string;
}

interface QuestionSubjectProps {
    educationLevelSlug: string;
    gradeSlug: string;
    value?: string;
    onSelect: (id: string, name: string, slug: string) => void;
}

import { QuizChoice, type QuizOption } from '@/components/dashboard/quiz/QuizChoice';

const SUBJECT_ICONS: Record<string, typeof BookOpen> = {
    'lingua-portuguesa': BookOpen,
    'matematica': Calculator,
    'ciencias': Microscope,
    'geografia': Globe,
    'historia': Scroll,
    'artes': Palette,
    'educacao-fisica': Heart,
    'musica': Music,
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
    const isEI = educationLevelSlug === 'educacao-infantil';
    const {
        data: subjects = [],
        isLoading: loading,
        error,
    } = useSubjects(educationLevelSlug, gradeSlug);

    const quizOptions: QuizOption[] = useMemo(() => subjects.map(subject => ({
        id: subject.id || subject.slug,
        slug: subject.slug,
        name: subject.name,
        icon: SUBJECT_ICONS[subject.slug] || BookOpen
    })), [subjects]);

    return (
        <QuizStep
            title={isEI ? 'Qual campo de experiência?' : 'Qual componente curricular?'}
            description="Selecione a área principal deste pedido."
        >
            {error ? (
                <div className="text-center py-12">
                    <p className="text-destructive font-bold">{error instanceof Error ? error.message : 'Erro ao carregar'}</p>
                </div>
            ) : (
                <QuizChoice
                    options={quizOptions}
                    value={value}
                    onSelect={(opt) => onSelect(opt.id, opt.name, opt.slug)}
                    loading={loading}
                    autoAdvance={true}
                />
            )}
        </QuizStep>
    );
}
