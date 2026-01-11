'use client';

import { BookOpen, Layout } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizChoice } from '@/components/client/quiz/QuizChoice';

interface QuestionBnccAlignmentProps {
    onSelect: (hasAlignment: boolean) => void;
}

export function QuestionBnccAlignment({ onSelect }: QuestionBnccAlignmentProps) {
    return (
        <QuizStep
            title="Este material tem alinhamento com a BNCC?"
            description="Alguns materiais como murais de presença não precisam de alinhamento curricular específico."
        >
            <QuizChoice
                options={[
                    {
                        id: 'yes',
                        slug: 'yes',
                        name: 'Sim, tem alinhamento',
                        description: 'Material pedagógico com objetivos de aprendizagem específicos',
                        icon: BookOpen
                    },
                    {
                        id: 'no',
                        slug: 'no',
                        name: 'Não, é material geral',
                        description: 'Material organizacional ou de apoio sem objetivos curriculares',
                        icon: Layout
                    }
                ]}
                onSelect={(opt) => onSelect(opt.slug === 'yes')}
                autoAdvance={true}
            />
        </QuizStep>
    );
}
