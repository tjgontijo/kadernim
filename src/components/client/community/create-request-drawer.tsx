'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { triggerCannon } from '@/lib/utils/confetti';

import { QuizLayout } from '@/components/client/quiz/QuizLayout';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizAction } from '@/components/client/quiz/QuizAction';

import { QuestionEducationLevel } from './questions/question-education-level';
import { QuestionGrade } from './questions/question-grade';
import { QuestionSubject } from './questions/question-subject';
import { QuestionRefineDescription } from './questions/question-refine-description';
import { QuestionSelectTitle } from './questions/question-select-title';

/**
 * Wizard state interface - Segue a mesma estrutura do Plano de Aula
 */
export interface CommunityWizardState {
    educationLevelId?: string;
    educationLevelSlug?: string;
    educationLevelName?: string;
    gradeId?: string;
    gradeSlug?: string;
    gradeName?: string;
    subjectId?: string;
    subjectSlug?: string;
    subjectName?: string;
    rawDescription?: string;
    selectedDescription?: string;
    title?: string;
}

/**
 * Question step type - Ordem: Etapa → Ano → Disciplina → Descrição → Refine → Title → Review
 */
export type CommunityStep =
    | 'education-level'
    | 'grade'
    | 'subject'
    | 'description'
    | 'refine'
    | 'select-title'
    | 'review'
    | 'submitting'
    | 'success';

interface CreateRequestDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TOTAL_STEPS = 7;

export function CreateRequestDrawer({ open, onOpenChange }: CreateRequestDrawerProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState<CommunityStep>('education-level');
    const [wizardState, setWizardState] = useState<CommunityWizardState>({});
    const [history, setHistory] = useState<CommunityStep[]>(['education-level']);

    const stepNumber = getStepNumber(currentStep);

    const goToNextStep = (nextStep: CommunityStep, updates: Partial<CommunityWizardState>) => {
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

    // Avança para seleção de título após escolher descrição
    const handleDescriptionSelected = (description: string) => {
        goToNextStep('select-title', { selectedDescription: description });
    };

    // Após selecionar título, avança para review
    const handleTitleSelected = (title: string) => {
        goToNextStep('review', { title });
    };

    const handleSubmit = async () => {
        try {
            setCurrentStep('submitting');
            const response = await fetch('/api/v1/community/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: wizardState.title,
                    description: wizardState.selectedDescription || wizardState.rawDescription,
                    educationLevelId: wizardState.educationLevelId,
                    gradeId: wizardState.gradeId,
                    subjectId: wizardState.subjectId,
                }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Erro ao enviar pedido');

            toast.success('Sugestão enviada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['community.requests'] });
            queryClient.invalidateQueries({ queryKey: ['community.usage'] });
            setCurrentStep('success');
            triggerCannon();
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao enviar pedido');
            setCurrentStep('review');
        }
    };

    const handleClose = () => {
        setCurrentStep('education-level');
        setWizardState({});
        setHistory(['education-level']);
        onOpenChange(false);
    };

    const canGoBack = history.length > 1 &&
        currentStep !== 'submitting' &&
        currentStep !== 'success' &&
        currentStep !== 'select-title';

    return (
        <QuizLayout
            open={open}
            onClose={handleClose}
            title="Sugerir Novo Material"
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
                    {/* 1. Etapa de Ensino */}
                    {currentStep === 'education-level' && (
                        <QuestionEducationLevel
                            value={wizardState.educationLevelId}
                            onSelect={(id, name, slug) =>
                                goToNextStep('grade', {
                                    educationLevelId: id,
                                    educationLevelName: name,
                                    educationLevelSlug: slug,
                                })
                            }
                        />
                    )}

                    {/* 2. Ano/Faixa Etária (filtrado pela etapa) */}
                    {currentStep === 'grade' && wizardState.educationLevelSlug && (
                        <QuestionGrade
                            educationLevelSlug={wizardState.educationLevelSlug}
                            value={wizardState.gradeId}
                            onSelect={(id, name, slug) =>
                                goToNextStep('subject', {
                                    gradeId: id,
                                    gradeName: name,
                                    gradeSlug: slug,
                                })
                            }
                        />
                    )}

                    {/* 3. Componente Curricular (filtrado pelo ano) */}
                    {currentStep === 'subject' && wizardState.gradeSlug && (
                        <QuestionSubject
                            educationLevelSlug={wizardState.educationLevelSlug || ''}
                            gradeSlug={wizardState.gradeSlug}
                            value={wizardState.subjectId}
                            onSelect={(id: string, name: string, slug: string) =>
                                goToNextStep('description', {
                                    subjectId: id,
                                    subjectName: name,
                                    subjectSlug: slug,
                                })
                            }
                        />
                    )}


                    {/* 4. Descrição Livre */}
                    {currentStep === 'description' && (
                        <QuizStep
                            title="O que devemos criar?"
                            description="Descreva sua ideia livremente. A IA vai te ajudar a estruturar."
                        >
                            <div className="space-y-6">
                                <textarea
                                    className="w-full h-48 bg-muted/50 border-2 border-border/50 rounded-[32px] p-6 font-medium focus:border-primary focus:ring-0 transition-all outline-none resize-none"
                                    placeholder="Descreva o material que você precisa..."
                                    value={wizardState.rawDescription || ''}
                                    onChange={(e) =>
                                        setWizardState((prev) => ({ ...prev, rawDescription: e.target.value }))
                                    }
                                />

                                <QuizAction
                                    label="Melhorar com IA"
                                    icon={Sparkles}
                                    disabled={!wizardState.rawDescription || wizardState.rawDescription.length < 20}
                                    onClick={() => goToNextStep('refine', {})}
                                />
                            </div>
                        </QuizStep>
                    )}

                    {/* 5. Refinamento IA */}
                    {currentStep === 'refine' && (
                        <QuestionRefineDescription
                            rawDescription={wizardState.rawDescription || ''}
                            educationLevelName={wizardState.educationLevelName || ''}
                            subjectName={wizardState.subjectName || ''}
                            gradeNames={[wizardState.gradeName || '']}
                            onSelect={handleDescriptionSelected}
                        />
                    )}

                    {/* 6. Seleção de Título */}
                    {currentStep === 'select-title' && (
                        <QuestionSelectTitle
                            description={wizardState.selectedDescription || wizardState.rawDescription || ''}
                            onSelect={handleTitleSelected}
                        />
                    )}

                    {/* 7. Revisão Final */}
                    {currentStep === 'review' && (
                        <QuizStep
                            title="Tudo pronto?"
                            description="Revise as informações antes de enviar."
                        >
                            <div className="bg-muted/30 rounded-[32px] p-6 border-2 border-border/50 space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Etapa</div>
                                        <div className="text-sm font-bold">{wizardState.educationLevelName}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Ano</div>
                                        <div className="text-sm font-bold">{wizardState.gradeName}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Disciplina</div>
                                    <div className="text-sm font-bold">{wizardState.subjectName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Título</div>
                                    <div className="text-lg font-black">{wizardState.title}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Descrição</div>
                                    <div className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-4">
                                        {wizardState.selectedDescription || wizardState.rawDescription}
                                    </div>
                                </div>
                            </div>

                            <QuizAction
                                label="Publicar Sugestão"
                                icon={Send}
                                onClick={handleSubmit}
                            />
                        </QuizStep>
                    )}

                    {/* Submitting */}
                    {currentStep === 'submitting' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <h2 className="text-2xl font-black">Enviando seu pedido...</h2>
                        </div>
                    )}

                    {/* Success */}
                    {currentStep === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 text-center px-6">
                            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Sparkles className="h-12 w-12 fill-current" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black">Sugestão Enviada!</h2>
                                <p className="text-xl text-muted-foreground font-medium">
                                    Agora é com a comunidade. Divulgue seu pedido para ganhar votos!
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="h-16 px-12 rounded-2xl font-black text-xl"
                                onClick={handleClose}
                            >
                                Voltar para os Pedidos
                            </Button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </QuizLayout>
    );
}

function getStepNumber(step: CommunityStep): number {
    const stepMap: Record<CommunityStep, number> = {
        'education-level': 1,
        'grade': 2,
        'subject': 3,
        'description': 4,
        'refine': 5,
        'select-title': 6,
        'review': 7,
        'submitting': 7,
        'success': 7,
    };
    return stepMap[step] || 1;
}
