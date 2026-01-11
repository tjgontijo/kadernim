'use client';

import { useBnccSkills } from '@/hooks/use-taxonomy';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizChoice } from '@/components/client/quiz/QuizChoice';

interface QuestionBnccSkillsProps {
    educationLevelSlug: string;
    gradeSlug: string;
    subjectSlug: string;
    selectedSkills: string[];
    maxSkills: number;
    onChange: (skills: string[]) => void;
    onContinue: () => void;
}

export function QuestionBnccSkills({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    selectedSkills,
    maxSkills,
    onChange,
    onContinue
}: QuestionBnccSkillsProps) {
    const { data: skills, isLoading } = useBnccSkills({
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
        limit: 100,
        searchMode: 'text'
    });

    const quizOptions = skills?.map(skill => ({
        id: skill.code,
        slug: skill.code,
        name: skill.code,
        description: skill.description
    })) || [];

    const handleSelect = (opt: any) => {
        const exists = selectedSkills.includes(opt.slug);
        if (exists) {
            onChange(selectedSkills.filter(code => code !== opt.slug));
        } else if (selectedSkills.length < maxSkills) {
            onChange([...selectedSkills, opt.slug]);
        }
    };

    return (
        <QuizStep
            title="Selecione as habilidades BNCC"
            description={`Escolha até ${maxSkills} habilidades que o material deve desenvolver.`}
        >
            <QuizChoice
                options={quizOptions}
                value={selectedSkills}
                onSelect={handleSelect}
                multiple={true}
                maxSelection={maxSkills}
                showCounter={true}
                loading={isLoading}
                onContinue={onContinue}
                continueLabel="Continuar"
            />
        </QuizStep>
    );
}
