'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Sparkles } from 'lucide-react';
import { Drawer, DrawerContent, DrawerClose, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDownloadFile } from '@/hooks/use-download-file';
import { QuizProgress } from './quiz-progress';
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

/**
 * CreatePlanDrawer - Wizard em formato quiz para criar planos de aula
 */
export function CreatePlanDrawer({ open, onOpenChange }: CreatePlanDrawerProps) {
  const [currentStep, setCurrentStep] = useState<QuestionStep>('education-level');
  const [wizardState, setWizardState] = useState<WizardState>({});
  const [history, setHistory] = useState<QuestionStep[]>(['education-level']);

  const stepNumber = getStepNumber(currentStep);

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

  const handleGenerate = async () => {
    try {
      goToNextStep('generating', {});

      const isEI = wizardState.educationLevelSlug === 'educacao-infantil';

      const response = await fetch('/api/v1/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: wizardState.title,
          numberOfClasses: wizardState.numberOfClasses,
          educationLevelSlug: wizardState.educationLevelSlug,
          // Mapeamento correto para EI vs EF
          gradeSlug: isEI ? undefined : wizardState.gradeSlug,
          subjectSlug: isEI ? undefined : wizardState.subjectSlug,
          ageRange: isEI ? wizardState.gradeSlug : undefined,
          fieldOfExperience: isEI ? wizardState.subjectSlug : undefined,
          bnccSkillCodes: wizardState.bnccSkillCodes,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar plano');
      }

      // Aguardar animação de loading finalizar
      setTimeout(() => {
        goToNextStep('success', { planId: data.data.id });
      }, 500);
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Erro ao gerar plano', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
      goToPreviousStep();
    }
  };

  const handleClose = () => {
    setCurrentStep('education-level');
    setWizardState({});
    setHistory(['education-level']);
    onOpenChange(false);
  };

  const { downloadFile } = useDownloadFile();

  const handleDownload = (format: 'docx' | 'pdf') => {
    if (!wizardState.planId) return;
    const url = `/api/v1/lesson-plans/${wizardState.planId}/export/${format}`;
    const filename = `plano-de-aula-${wizardState.title?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30) || 'novo'}.${format}`;
    downloadFile(url, { filename });
  };

  const canGoBack = history.length > 1 && currentStep !== 'generating' && currentStep !== 'success';

  return (
    <Drawer open={open} onOpenChange={handleClose} shouldScaleBackground={false}>
      <DrawerContent className="!mt-0 !inset-0 h-[100vh] max-h-none rounded-none border-none bg-background">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Criar Plano de Aula</DrawerTitle>
          <DrawerDescription>
            Siga os passos para gerar um plano de aula personalizado com IA.
          </DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto w-full max-w-2xl flex flex-col h-full overflow-hidden">
          {/* Header */}
          {currentStep !== 'generating' && currentStep !== 'success' && (
            <div className="border-b pb-4 pt-6 px-6 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10">
                  {canGoBack && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={goToPreviousStep}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                <QuizProgress current={stepNumber} total={TOTAL_STEPS} />

                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>

              <div className="flex items-center gap-2 justify-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Criar Novo Plano de Aula</h2>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="flex-1 overflow-hidden relative">
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
                      theme={wizardState.title} // Tema selecionado para busca híbrida
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
                    onGenerate={handleGenerate}
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
          </div>
        </div>
      </DrawerContent>
    </Drawer>
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
