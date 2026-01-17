'use client';

import { useEducationLevels, useGrades, useSubjects } from '@/hooks/entities/use-taxonomy';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizSelect } from '@/components/client/quiz/QuizSelect';
import { QuizAction } from '@/components/client/quiz/QuizAction';

interface CommunityWizardState {
    educationLevelId?: string;
    educationLevelSlug?: string;
    educationLevelName?: string;
    gradeId?: string;
    gradeSlug?: string;
    gradeName?: string;
    subjectId?: string;
    subjectSlug?: string;
    subjectName?: string;
}

interface QuestionTaxonomyProps {
    educationLevelSlug?: string;
    gradeSlug?: string;
    subjectSlug?: string;
    onChange: (updates: Partial<CommunityWizardState>) => void;
    onContinue: () => void;
}

export function QuestionTaxonomy({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    onChange,
    onContinue
}: QuestionTaxonomyProps) {
    const { data: educationLevels } = useEducationLevels();
    const { data: grades } = useGrades(educationLevelSlug);
    const { data: subjects } = useSubjects(educationLevelSlug, gradeSlug, true);

    const isComplete = educationLevelSlug && gradeSlug && subjectSlug;

    return (
        <QuizStep
            title="Para qual etapa é o material?"
            description="Selecione a etapa, ano e componente curricular."
        >
            <div className="space-y-4">
                {/* Etapa de Ensino */}
                <QuizSelect
                    label="Etapa de Ensino"
                    placeholder="Selecione a etapa"
                    options={educationLevels?.map(el => ({ value: el.slug, label: el.name })) || []}
                    value={educationLevelSlug}
                    onChange={(slug) => {
                        const level = educationLevels?.find(el => el.slug === slug);
                        onChange({
                            educationLevelId: level?.id,
                            educationLevelSlug: slug,
                            educationLevelName: level?.name,
                            gradeId: undefined,
                            gradeSlug: undefined,
                            gradeName: undefined,
                            subjectId: undefined,
                            subjectSlug: undefined,
                            subjectName: undefined,
                        });
                    }}
                />

                {/* Ano/Faixa Etária */}
                <QuizSelect
                    label="Ano/Faixa Etária"
                    placeholder="Selecione o ano"
                    options={grades?.map(g => ({ value: g.slug, label: g.name })) || []}
                    value={gradeSlug}
                    onChange={(slug) => {
                        const grade = grades?.find(g => g.slug === slug);
                        onChange({
                            gradeId: grade?.id,
                            gradeSlug: slug,
                            gradeName: grade?.name,
                            subjectId: undefined,
                            subjectSlug: undefined,
                            subjectName: undefined,
                        });
                    }}
                    disabled={!educationLevelSlug}
                />

                {/* Componente Curricular */}
                <QuizSelect
                    label="Componente Curricular"
                    placeholder="Selecione o componente"
                    options={subjects?.map(s => ({ value: s.slug, label: s.name })) || []}
                    value={subjectSlug}
                    onChange={(slug) => {
                        const subject = subjects?.find(s => s.slug === slug);
                        onChange({
                            subjectId: subject?.id,
                            subjectSlug: slug,
                            subjectName: subject?.name,
                        });
                    }}
                    disabled={!gradeSlug}
                />

                <QuizAction
                    label="Continuar"
                    disabled={!isComplete}
                    onClick={onContinue}
                />
            </div>
        </QuizStep>
    );
}
