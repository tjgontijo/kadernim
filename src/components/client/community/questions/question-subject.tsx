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
import { QuizStep } from '@/components/quiz/QuizStep';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';

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
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isEI = educationLevelSlug === 'educacao-infantil';

    useEffect(() => {
        async function fetchSubjects() {
            try {
                setLoading(true);
                // Filtra por gradeSlug para obter disciplinas específicas do ano
                const response = await fetch(
                    `/api/v1/subjects?educationLevelSlug=${educationLevelSlug}&gradeSlug=${gradeSlug}`
                );
                if (!response.ok) throw new Error('Erro ao carregar componentes curiculares');
                const data = await response.json();
                if (data.success) {
                    setSubjects(data.data);
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

    const handleSelect = (subject: Subject) => {
        setTimeout(() => {
            onSelect(subject.id || subject.slug, subject.name, subject.slug);
        }, 400);
    };

    return (
        <QuizStep
            title={isEI ? 'Qual campo de experiência?' : 'Qual componente curricular?'}
            description="Selecione a área principal deste pedido."
        >
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-[24px]" />
                    ))
                ) : error ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-destructive font-bold">{error}</p>
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <QuizCard
                            key={subject.slug}
                            title={subject.name}
                            icon={SUBJECT_ICONS[subject.slug] || BookOpen}
                            selected={value === (subject.id || subject.slug)}
                            onClick={() => handleSelect(subject)}
                        />
                    ))
                )}
            </div>
        </QuizStep>
    );
}
