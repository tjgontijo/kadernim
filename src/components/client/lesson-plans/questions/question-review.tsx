'use client';

import { Edit2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from '../quiz-question';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    <QuizQuestion
      title="Revise seu plano"
      description="Confira as informações antes de gerar"
    >
      <div className="flex flex-col gap-4">
        {/* Turma / Identificação */}
        <div className="flex items-start justify-between p-4 rounded-xl border bg-card">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Identificação</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold w-20">Etapa:</span>
                <Badge variant="outline" className="text-[11px] h-5">{educationLevelName}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold w-20">
                  {educationLevelName?.toLowerCase().includes('infantil') ? 'Faixa Etária:' : 'Ano/Série:'}
                </span>
                <Badge variant="outline" className="text-[11px] h-5">{gradeName}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold w-20">
                  {educationLevelName?.toLowerCase().includes('infantil') ? 'Campo:' : 'Componente:'}
                </span>
                <Badge variant="outline" className="text-[11px] h-5">{subjectName}</Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onEdit('education-level')}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Tema */}
        <div className="flex items-start justify-between p-4 rounded-xl border bg-card">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Tema</p>
            <p className="text-sm font-semibold">{title || 'Não definido'}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onEdit('theme')}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Duração */}
        <div className="flex items-start justify-between p-4 rounded-xl border bg-card">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Duração</p>
            <p className="text-sm font-semibold">
              {numberOfClasses} {numberOfClasses === 1 ? 'aula' : 'aulas'} (
              {(numberOfClasses || 0) * 50} minutos)
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onEdit('duration')}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Habilidades BNCC */}
        <div className="flex items-start justify-between p-4 rounded-xl border bg-card">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Habilidades BNCC</p>
              <Badge variant="outline">{bnccSkillDetails.length} selecionadas</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {bnccSkillDetails.map((skill) => (
                <div key={skill.code} className="text-sm">
                  <span className="font-semibold">{skill.code}</span>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onEdit('skills')}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="my-2" />

        {/* Botão Gerar */}
        <Button
          onClick={onGenerate}
          disabled={generating}
          size="lg"
          className="w-full text-base font-semibold h-12"
        >
          {generating ? (
            <>Gerando plano...</>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Gerar Meu Plano de Aula
            </>
          )}
        </Button>

        {!generating && (
          <p className="text-xs text-center text-muted-foreground">
            A geração leva aproximadamente 15 segundos
          </p>
        )}
      </div>
    </QuizQuestion>
  );
}
