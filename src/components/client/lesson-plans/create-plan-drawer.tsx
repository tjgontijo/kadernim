'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useDownloadFile } from '@/hooks/use-download-file';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuizLayout } from '@/components/client/quiz/QuizLayout';

import { QuestionEducationLevel } from './questions/question-education-level';
import { QuestionGrade } from './questions/question-grade';
import { QuestionSubject } from './questions/question-subject';
import { QuestionTheme } from './questions/question-theme';
import { QuestionDuration } from './questions/question-duration';
import { QuestionSkills } from './questions/question-skills';
import { QuestionReview } from './questions/question-review';
import { QuestionGenerating } from './questions/question-generating';
import { QuestionSuccess } from './questions/question-success';

/**
 * Wizard state interface
 */
export interface WizardState {
  educationLevelSlug?: string;
  educationLevelName?: string;
  gradeSlug?: string;
  gradeName?: string;
  subjectSlug?: string;
  subjectName?: string;
  title?: string;
  numberOfClasses?: number;
  bnccSkillCodes?: string[];
  bnccSkillDetails?: Array<{ code: string; description: string }>;
  planId?: string;
}

/**
 * Question step type
 */
export type QuestionStep =
  | 'education-level'
  | 'grade'
  | 'subject'
  | 'theme'
  | 'duration'
  | 'skills'
  | 'review'
  | 'generating'
  | 'success';

interface CreatePlanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOTAL_STEPS = 7;

export function CreatePlanDrawer({ open, onOpenChange }: CreatePlanDrawerProps) {
  const [currentStep, setCurrentStep] = useState<QuestionStep>('education-level');
  const [wizardState, setWizardState] = useState<WizardState>({});
  const [history, setHistory] = useState<QuestionStep[]>(['education-level']);

  const queryClient = useQueryClient();
  const { downloadFile } = useDownloadFile();

  const stepNumber = getStepNumber(currentStep);

  // Mutação para gerar o plano final
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/v1/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: wizardState.title,
          numberOfClasses: wizardState.numberOfClasses,
          educationLevelSlug: wizardState.educationLevelSlug,
          gradeSlug: wizardState.gradeSlug,
          subjectSlug: wizardState.subjectSlug,
          bnccSkillCodes: wizardState.bnccSkillCodes,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erro ao gerar plano');
      return data.data;
    },
    onMutate: () => {
      goToNextStep('generating', {});
    },
    onSuccess: (data) => {
      // Invalida a lista de planos para disparar o refresh automático na página de trás
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-plan-usage'] });

      setTimeout(() => {
        goToNextStep('success', { planId: data.id });
      }, 500);
    },
    onError: (error) => {
      console.error('Error generating plan:', error);
      toast.error('Erro ao gerar plano', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
      goToPreviousStep();
    },
  });

  const goToNextStep = (nextStep: QuestionStep, updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
    setCurrentStep(nextStep);
    setHistory((prev) => [...prev, nextStep]);
  };

  const goToPreviousStep = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentStep(previousStep);
    }
  };

  const goToStep = (step: QuestionStep) => {
    setCurrentStep(step);
    setHistory((prev) => [...prev, step]);
  };

  const handleClose = () => {
    setCurrentStep('education-level');
    setWizardState({});
    setHistory(['education-level']);
    onOpenChange(false);
  };

  const handleDownload = (format: 'docx' | 'pdf') => {
    if (!wizardState.planId) return;
    const url = `/api/v1/lesson-plans/${wizardState.planId}/export/${format}`;
    const filename = `plano-de-aula-${wizardState.title?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30) || 'novo'}.${format}`;
    downloadFile(url, { filename });
  };

  const canGoBack = history.length > 1 && currentStep !== 'generating' && currentStep !== 'success';

  return (
    <QuizLayout
      open={open}
      onClose={handleClose}
      title="Criar Novo Plano de Aula"
      currentStep={stepNumber}
      totalSteps={TOTAL_STEPS}
      onBack={goToPreviousStep}
      showBack={canGoBack}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 overflow-y-auto scrollbar-thin p-6"
        >
          {currentStep === 'education-level' && (
            <QuestionEducationLevel
              value={wizardState.educationLevelSlug}
              onSelect={(slug, name) =>
                goToNextStep('grade', {
                  educationLevelSlug: slug,
                  educationLevelName: name,
                })
              }
            />
          )}

          {currentStep === 'grade' && wizardState.educationLevelSlug && (
            <QuestionGrade
              educationLevelSlug={wizardState.educationLevelSlug}
              value={wizardState.gradeSlug}
              onSelect={(slug, name) =>
                goToNextStep('subject', {
                  gradeSlug: slug,
                  gradeName: name,
                })
              }
            />
          )}

          {currentStep === 'subject' &&
            wizardState.educationLevelSlug &&
            wizardState.gradeSlug && (
              <QuestionSubject
                educationLevelSlug={wizardState.educationLevelSlug}
                gradeSlug={wizardState.gradeSlug}
                value={wizardState.subjectSlug}
                onSelect={(slug, name) =>
                  goToNextStep('theme', {
                    subjectSlug: slug,
                    subjectName: name,
                  })
                }
              />
            )}

          {currentStep === 'theme' &&
            wizardState.educationLevelSlug &&
            wizardState.gradeSlug &&
            wizardState.subjectSlug && (
              <QuestionTheme
                value={wizardState.title || ''}
                onChange={(value) =>
                  setWizardState((prev) => ({ ...prev, title: value }))
                }
                onContinue={() => goToNextStep('duration', {})}
                educationLevelSlug={wizardState.educationLevelSlug}
                gradeSlug={wizardState.gradeSlug}
                subjectSlug={wizardState.subjectSlug}
              />
            )}

          {currentStep === 'duration' && (
            <QuestionDuration
              value={wizardState.numberOfClasses}
              onSelect={(numberOfClasses) =>
                goToNextStep('skills', { numberOfClasses })
              }
            />
          )}

          {currentStep === 'skills' &&
            wizardState.educationLevelSlug &&
            wizardState.gradeSlug &&
            wizardState.subjectSlug && (
              <QuestionSkills
                educationLevelSlug={wizardState.educationLevelSlug}
                gradeSlug={wizardState.gradeSlug}
                subjectSlug={wizardState.subjectSlug}
                theme={wizardState.title}
                values={wizardState.bnccSkillCodes || []}
                skillDetails={wizardState.bnccSkillDetails || []}
                onSelect={(codes, details) =>
                  setWizardState((prev) => ({
                    ...prev,
                    bnccSkillCodes: codes,
                    bnccSkillDetails: details,
                  }))
                }
                onContinue={() => goToNextStep('review', {})}
              />
            )}

          {currentStep === 'review' && (
            <QuestionReview
              data={wizardState}
              onEdit={goToStep}
              onGenerate={() => generateMutation.mutate()}
            />
          )}

          {currentStep === 'generating' && <QuestionGenerating />}

          {currentStep === 'success' && wizardState.planId && wizardState.title && (
            <QuestionSuccess
              planId={wizardState.planId}
              title={wizardState.title}
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

function getStepNumber(step: QuestionStep): number {
  const stepMap: Record<QuestionStep, number> = {
    'education-level': 1,
    'grade': 2,
    'subject': 3,
    'theme': 4,
    'duration': 5,
    'skills': 6,
    'review': 7,
    'generating': 7,
    'success': 7,
  };
  return stepMap[step] || 1;
}
