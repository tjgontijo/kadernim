'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { QuestionEducationLevel } from './questions/question-education-level';
import { triggerCannon } from '@/lib/utils/confetti';

export interface CommunityWizardState {
    educationLevelId?: string;
    educationLevelName?: string;
    gradeId?: string;
    gradeName?: string;
    subjectId?: string;
    subjectName?: string;
    title?: string;
    description?: string;
}

export type CommunityStep =
    | 'education-level'
    | 'category' // Combination of grade/subject
    | 'content'
    | 'review'
    | 'submitting'
    | 'success';

interface CreateRequestDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TOTAL_STEPS = 4;

import { QuizLayout } from '@/components/quiz/QuizLayout';
import { QuizStep } from '@/components/quiz/QuizStep';
import { QuizAction } from '@/components/quiz/QuizAction';

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

    const handleSubmit = async () => {
        try {
            setCurrentStep('submitting');
            const response = await fetch('/api/v1/community/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: wizardState.title,
                    description: wizardState.description,
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

    const canGoBack = history.length > 1 && currentStep !== 'submitting' && currentStep !== 'success';

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
                    {currentStep === 'education-level' && (
                        <QuestionEducationLevel
                            value={wizardState.educationLevelId}
                            onSelect={(id, name) =>
                                goToNextStep('content', {
                                    educationLevelId: id,
                                    educationLevelName: name,
                                })
                            }
                        />
                    )}

                    {currentStep === 'content' && (
                        <QuizStep
                            title="O que devemos criar?"
                            description="Dê um título direto e uma explicação do que você precisa."
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                                        Título do Pedido
                                    </label>
                                    <input
                                        className="w-full h-14 bg-muted/50 border-2 border-border/50 rounded-2xl px-5 font-bold focus:border-primary focus:ring-0 transition-all outline-none"
                                        placeholder="Digite o título do seu pedido..."
                                        value={wizardState.title || ''}
                                        onChange={(e) => setWizardState(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                                        Descrição Detalhada
                                    </label>
                                    <textarea
                                        className="w-full h-40 bg-muted/50 border-2 border-border/50 rounded-3xl p-5 font-medium focus:border-primary focus:ring-0 transition-all outline-none resize-none"
                                        placeholder="Descreva detalhadamente o que você precisa..."
                                        value={wizardState.description || ''}
                                        onChange={(e) => setWizardState(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                <QuizAction
                                    label="Continuar"
                                    disabled={!wizardState.title || !wizardState.description || wizardState.title.length < 5 || wizardState.description.length < 20}
                                    onClick={() => goToNextStep('review', {})}
                                />
                            </div>
                        </QuizStep>
                    )}

                    {currentStep === 'review' && (
                        <QuizStep
                            title="Tudo pronto?"
                            description="Revise as informações antes de enviar para a comunidade votar."
                        >
                            <div className="bg-muted/30 rounded-[32px] p-8 border-2 border-border/50 space-y-6">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Etapa</div>
                                    <div className="text-xl font-black">{wizardState.educationLevelName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Título</div>
                                    <div className="text-lg font-bold leading-tight">{wizardState.title}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Descrição</div>
                                    <div className="text-sm font-medium text-muted-foreground leading-relaxed">{wizardState.description}</div>
                                </div>
                            </div>

                            <QuizAction
                                label="Publicar Sugestão"
                                icon={Send}
                                onClick={handleSubmit}
                            />
                        </QuizStep>
                    )}

                    {currentStep === 'submitting' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <h2 className="text-2xl font-black">Enviando seu pedido...</h2>
                        </div>
                    )}

                    {currentStep === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 text-center px-6">
                            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Sparkles className="h-12 w-12 fill-current" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black">Sugestão Enviada!</h2>
                                <p className="text-xl text-muted-foreground font-medium">Agora é com a comunidade. Divulgue seu pedido para ganhar votos!</p>
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
        'category': 2,
        'content': 3,
        'review': 4,
        'submitting': 4,
        'success': 4,
    };
    return stepMap[step] || 1;
}
