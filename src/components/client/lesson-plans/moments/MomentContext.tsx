'use client';

import { useMemo, useRef } from 'react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizSelect } from '@/components/client/quiz/QuizSelect';
import { QuizAction } from '@/components/client/quiz/QuizAction';
import { useEducationLevels, useGrades, useSubjects } from '@/hooks/use-taxonomy';

interface MomentContextData {
    educationLevelSlug?: string;
    educationLevelName?: string;
    gradeSlug?: string;
    gradeName?: string;
    subjectSlug?: string;
    subjectName?: string;
    numberOfClasses?: number;
}

interface MomentContextProps {
    data: MomentContextData;
    onChange: (updates: Partial<MomentContextData>) => void;
    onContinue: () => void;
}

const DURATION_OPTIONS = [
    { value: '1', label: '1 aula', description: '50 minutos' },
    { value: '2', label: '2 aulas', description: '100 minutos' },
    { value: '3', label: '3 aulas', description: '150 minutos' },
];

/**
 * Momento 1: Contexto da Aula
 * Tela única com 4 seleções: Etapa, Ano, Disciplina, Duração
 */
export function MomentContext({ data, onChange, onContinue }: MomentContextProps) {
    const { data: educationLevels = [], isLoading: loadingLevels } = useEducationLevels();
    const { data: grades = [], isLoading: loadingGrades } = useGrades(data.educationLevelSlug);
    const { data: subjects = [], isLoading: loadingSubjects } = useSubjects(
        data.educationLevelSlug,
        data.gradeSlug,
        true // bnccOnly
    );

    const isEI = data.educationLevelSlug === 'educacao-infantil';

    // Track previous values to detect changes and reset dependents
    const prevLevelRef = useRef(data.educationLevelSlug);
    const prevGradeRef = useRef(data.gradeSlug);

    // Mapear opções
    const levelOptions = useMemo(() =>
        educationLevels.map(l => ({ value: l.slug, label: l.name })),
        [educationLevels]
    );

    const gradeOptions = useMemo(() =>
        grades.map(g => ({ value: g.slug, label: g.name })),
        [grades]
    );

    const subjectOptions = useMemo(() =>
        subjects.map(s => ({ value: s.slug, label: s.name })),
        [subjects]
    );

    // Handlers com reset de dependentes
    const handleLevelChange = (value: string, label: string) => {
        onChange({
            educationLevelSlug: value,
            educationLevelName: label,
            // Reset dependentes
            gradeSlug: undefined,
            gradeName: undefined,
            subjectSlug: undefined,
            subjectName: undefined,
        });
    };

    const handleGradeChange = (value: string, label: string) => {
        onChange({
            gradeSlug: value,
            gradeName: label,
            // Reset dependentes
            subjectSlug: undefined,
            subjectName: undefined,
        });
    };

    const handleSubjectChange = (value: string, label: string) => {
        onChange({
            subjectSlug: value,
            subjectName: label,
        });
    };

    const handleDurationChange = (value: string) => {
        onChange({ numberOfClasses: parseInt(value, 10) });
    };

    // Validação
    const isValid = Boolean(
        data.educationLevelSlug &&
        data.gradeSlug &&
        data.subjectSlug &&
        data.numberOfClasses
    );

    return (
        <QuizStep
            title="Para quem é essa aula?"
            description="Defina o contexto pedagógico do seu plano."
        >
            <div className="flex flex-col gap-5">
                {/* Etapa de Ensino */}
                <QuizSelect
                    label="Etapa de Ensino"
                    placeholder="Selecione a etapa..."
                    options={levelOptions}
                    value={data.educationLevelSlug}
                    onChange={handleLevelChange}
                    loading={loadingLevels}
                />

                {/* Ano / Faixa Etária */}
                <QuizSelect
                    label={isEI ? "Faixa Etária" : "Ano"}
                    placeholder={isEI ? "Selecione a faixa etária..." : "Selecione o ano..."}
                    options={gradeOptions}
                    value={data.gradeSlug}
                    onChange={handleGradeChange}
                    loading={loadingGrades}
                    disabled={!data.educationLevelSlug}
                />

                {/* Disciplina / Campo de Experiência */}
                <QuizSelect
                    label={isEI ? "Campo de Experiência" : "Disciplina"}
                    placeholder={isEI ? "Selecione o campo..." : "Selecione a disciplina..."}
                    options={subjectOptions}
                    value={data.subjectSlug}
                    onChange={handleSubjectChange}
                    loading={loadingSubjects}
                    disabled={!data.gradeSlug}
                />

                {/* Duração */}
                <QuizSelect
                    label="Duração"
                    placeholder="Quantas aulas?"
                    options={DURATION_OPTIONS}
                    value={data.numberOfClasses?.toString()}
                    onChange={handleDurationChange}
                    disabled={!data.subjectSlug}
                />

                {/* Botão Continuar */}
                <div className="pt-4">
                    <QuizAction
                        label="Continuar"
                        onClick={onContinue}
                        disabled={!isValid}
                    />
                </div>
            </div>
        </QuizStep>
    );
}
