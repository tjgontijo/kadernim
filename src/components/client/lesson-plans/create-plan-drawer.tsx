'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useDownloadFile } from '@/hooks/use-download-file';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuizLayout } from '@/components/client/quiz/QuizLayout';
import { MomentContext, MomentContent, MomentReview } from './moments';
import { QuestionGenerating } from './questions/question-generating';
import { QuestionSuccess } from './questions/question-success';

/**
 * Skill selection interface
 */
interface SkillSelection {
  code: string;
  description: string;
  role: 'main' | 'complementary';
}

/**
 * Wizard state interface - novo formato com 3 momentos
 */
export interface WizardState {
  // Momento 1: Contexto
  educationLevelSlug?: string;
  educationLevelName?: string;
  gradeSlug?: string;
  gradeName?: string;
  subjectSlug?: string;
  subjectName?: string;
  numberOfClasses?: number;
  // Momento 2: Conteúdo
  intentRaw?: string;
  selectedSkills: SkillSelection[];
  // Momento 3: Revisão (editável)
  title?: string;
  // Resultado
  planId?: string;
}

/**
 * Moment type (apenas 3 visíveis + estados de geração)
 */
export type Moment = 'context' | 'content' | 'review' | 'generating' | 'success';

interface CreatePlanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOMENT_LABELS: [string, string, string] = ['Contexto', 'Conteúdo', 'Revisão'];

function getMomentNumber(moment: Moment): 1 | 2 | 3 {
  switch (moment) {
    case 'context': return 1;
    case 'content': return 2;
    case 'review':
    case 'generating':
    case 'success':
      return 3;
  }
}

export function CreatePlanDrawer({ open, onOpenChange }: CreatePlanDrawerProps) {
  const [currentMoment, setCurrentMoment] = useState<Moment>('context');
  const [wizardState, setWizardState] = useState<WizardState>({ selectedSkills: [] });
  const [history, setHistory] = useState<Moment[]>(['context']);

  const queryClient = useQueryClient();
  const { downloadFile } = useDownloadFile();

  // Mutação para gerar o plano final
  const generateMutation = useMutation({
    mutationFn: async () => {
      const mainSkill = wizardState.selectedSkills.find(s => s.role === 'main');

      const response = await fetch('/api/v1/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Título: prioriza o que o usuário definiu, depois intentRaw
          // Se nenhum, deixa o backend gerar baseado no knowledgeObject
          title: wizardState.title || wizardState.intentRaw || undefined,
          numberOfClasses: wizardState.numberOfClasses,
          educationLevelSlug: wizardState.educationLevelSlug,
          gradeSlug: wizardState.gradeSlug,
          subjectSlug: wizardState.subjectSlug,
          bnccSkillCodes: wizardState.selectedSkills.map(s => s.code),
          intentRaw: wizardState.intentRaw,
          skills: wizardState.selectedSkills,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erro ao gerar plano');
      return data.data;
    },
    onMutate: () => {
      goToMoment('generating');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-usage'] });

      setTimeout(() => {
        setWizardState(prev => ({ ...prev, planId: data.id }));
        goToMoment('success');
      }, 500);
    },
    onError: (error) => {
      console.error('Error generating plan:', error);
      toast.error('Erro ao gerar plano', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
      goToPreviousMoment();
    },
  });

  const goToMoment = (moment: Moment) => {
    setCurrentMoment(moment);
    setHistory(prev => [...prev, moment]);
  };

  const goToPreviousMoment = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousMoment = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentMoment(previousMoment);
    }
  };

  const handleClose = () => {
    setCurrentMoment('context');
    setWizardState({ selectedSkills: [] });
    setHistory(['context']);
    onOpenChange(false);
  };

  const handleDownload = (format: 'docx' | 'pdf') => {
    if (!wizardState.planId) return;
    const url = `/api/v1/lesson-plans/${wizardState.planId}/export/${format}`;
    const filename = `plano-de-aula-${wizardState.title?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30) || 'novo'}.${format}`;
    downloadFile(url, { filename });
  };

  const canGoBack = history.length > 1 && currentMoment !== 'generating' && currentMoment !== 'success';
  const momentNumber = getMomentNumber(currentMoment);

  return (
    <QuizLayout
      open={open}
      onClose={handleClose}
      title="Criar Novo Plano de Aula"
      currentMoment={momentNumber}
      momentLabels={MOMENT_LABELS}
      onBack={goToPreviousMoment}
      showBack={canGoBack}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMoment}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 overflow-y-auto scrollbar-thin p-6"
        >
          {/* Momento 1: Contexto */}
          {currentMoment === 'context' && (
            <MomentContext
              data={{
                educationLevelSlug: wizardState.educationLevelSlug,
                educationLevelName: wizardState.educationLevelName,
                gradeSlug: wizardState.gradeSlug,
                gradeName: wizardState.gradeName,
                subjectSlug: wizardState.subjectSlug,
                subjectName: wizardState.subjectName,
                numberOfClasses: wizardState.numberOfClasses,
              }}
              onChange={(updates) => setWizardState(prev => ({ ...prev, ...updates }))}
              onContinue={() => goToMoment('content')}
            />
          )}

          {/* Momento 2: Conteúdo */}
          {currentMoment === 'content' &&
            wizardState.educationLevelSlug &&
            wizardState.gradeSlug &&
            wizardState.subjectSlug && (
              <MomentContent
                educationLevelSlug={wizardState.educationLevelSlug}
                gradeSlug={wizardState.gradeSlug}
                subjectSlug={wizardState.subjectSlug}
                data={{
                  intentRaw: wizardState.intentRaw,
                  selectedSkills: wizardState.selectedSkills,
                }}
                onChange={(updates) => setWizardState(prev => ({ ...prev, ...updates }))}
                onContinue={() => goToMoment('review')}
              />
            )}

          {/* Momento 3: Revisão */}
          {currentMoment === 'review' && (
            <MomentReview
              data={{
                educationLevelSlug: wizardState.educationLevelSlug,
                educationLevelName: wizardState.educationLevelName,
                gradeSlug: wizardState.gradeSlug,
                gradeName: wizardState.gradeName,
                subjectSlug: wizardState.subjectSlug,
                subjectName: wizardState.subjectName,
                numberOfClasses: wizardState.numberOfClasses,
                intentRaw: wizardState.intentRaw,
                selectedSkills: wizardState.selectedSkills,
                title: wizardState.title,
              }}
              onChange={(updates) => setWizardState(prev => ({ ...prev, ...updates }))}
              onGenerate={() => generateMutation.mutate()}
              isGenerating={generateMutation.isPending}
            />
          )}

          {/* Gerando */}
          {currentMoment === 'generating' && <QuestionGenerating />}

          {/* Sucesso */}
          {currentMoment === 'success' && wizardState.planId && (
            <QuestionSuccess
              planId={wizardState.planId}
              title={wizardState.title || wizardState.intentRaw || 'Plano de Aula'}
              onView={() => {
                window.location.href = `/lesson-plans/${wizardState.planId}`;
              }}
              onDownload={handleDownload}
              onClose={handleClose}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </QuizLayout>
  );
}
