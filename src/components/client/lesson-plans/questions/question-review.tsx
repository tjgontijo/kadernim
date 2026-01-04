'use client';

import { Sparkles, GraduationCap, FileText, Clock } from 'lucide-react';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizCard } from '@/components/client/quiz/QuizCard';
import { QuizAction } from '@/components/client/quiz/QuizAction';
import type { QuestionStep } from '../create-plan-drawer';

interface ReviewData {
  educationLevelName?: string;
  gradeName?: string;
  subjectName?: string;
  title?: string;
  numberOfClasses?: number;
  bnccSkillDetails?: Array<{ code: string; description: string }>;
}

interface QuestionReviewProps {
  data: ReviewData;
  onEdit: (step: QuestionStep) => void;
  onGenerate: () => void;
  generating?: boolean;
}

/**
 * Question 7: Revisão Final
 *
 * Resumo editável antes de gerar o plano
 */
export function QuestionReview({ data, onEdit, onGenerate, generating }: QuestionReviewProps) {
  const {
    educationLevelName,
    gradeName,
    subjectName,
    title,
    numberOfClasses,
    bnccSkillDetails = [],
  } = data;

  return (
    <QuizStep
      title="Tudo pronto?"
      description="Revise os detalhes do seu plano antes de começar a mágica."
    >
      <div className="flex flex-col gap-4">
        <QuizCard
          title="Identificação"
          description={`${educationLevelName} • ${gradeName} • ${subjectName}`}
          icon={GraduationCap}
          onClick={() => onEdit('education-level')}
          compact
        />

        <QuizCard
          title="Tema da Aula"
          description={title || 'Não definido'}
          icon={FileText}
          onClick={() => onEdit('theme')}
          compact
        />

        <QuizCard
          title="Duração"
          description={`${numberOfClasses} ${numberOfClasses === 1 ? 'aula' : 'aulas'} (${(numberOfClasses || 0) * 50} min)`}
          icon={Clock}
          onClick={() => onEdit('duration')}
          compact
        />

        <QuizCard
          title="Habilidades BNCC"
          description={`${bnccSkillDetails.length} habilidades selecionadas`}
          icon={Sparkles}
          onClick={() => onEdit('skills')}
          compact
        />

        <div className="pt-6">
          <QuizAction
            label={generating ? "Gerando seu plano..." : "Gerar Plano de Aula"}
            onClick={onGenerate}
            disabled={generating}
            loading={generating}
            icon={Sparkles}
          />
          {!generating && (
            <p className="text-[10px] text-center text-muted-foreground mt-4 font-black uppercase tracking-widest opacity-50">
              A geração leva cerca de 15 segundos
            </p>
          )}
        </div>
      </div>
    </QuizStep>
  );
}
