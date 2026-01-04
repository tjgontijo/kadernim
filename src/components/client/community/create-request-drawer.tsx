'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Sparkles, Send, Loader2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerClose, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { QuizProgress } from '@/components/client/lesson-plans/quiz-progress';
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

            if (!data.success) {
                throw new Error(data.error || 'Erro ao enviar pedido');
            }

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
        <Drawer open={open} onOpenChange={handleClose} shouldScaleBackground={false}>
            <DrawerContent className="!mt-0 !inset-0 h-[100vh] max-h-none rounded-none border-none bg-background">
                <div className="mx-auto w-full max-w-2xl flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    {currentStep !== 'submitting' && currentStep !== 'success' && (
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
                                <h2 className="text-lg font-bold">Sugerir Novo Material</h2>
                            </div>
                        </div>
                    )}

                    {/* Steps */}
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
                                        value={wizardState.educationLevelId}
                                        onSelect={(id, name) =>
                                            goToNextStep('content', {
                                                educationLevelId: id,
                                                educationLevelName: name,
                                            })
                                        }
                                    />
                                )}

                                {/* Simplified for now: Title and Description in one step */}
                                {currentStep === 'content' && (
                                    <div className="space-y-8 py-4 max-w-md mx-auto">
                                        <div className="space-y-3 text-center">
                                            <h2 className="text-3xl font-black tracking-tight">O que devemos criar?</h2>
                                            <p className="text-muted-foreground font-medium">Dê um título direto e uma explicação do que você precisa.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Título do Pedido</label>
                                                <input
                                                    className="w-full h-14 bg-muted/50 border-2 border-border/50 rounded-2xl px-5 font-bold focus:border-primary focus:ring-0 transition-all outline-none"
                                                    placeholder="Ex: Jogo de Tabuleiro sobre Frações"
                                                    value={wizardState.title || ''}
                                                    onChange={(e) => setWizardState(prev => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Descrição Detalhada</label>
                                                <textarea
                                                    className="w-full h-40 bg-muted/50 border-2 border-border/50 rounded-3xl p-5 font-medium focus:border-primary focus:ring-0 transition-all outline-none resize-none"
                                                    placeholder="Explique como você imagina esse material, objetivos pedagógicos, etc."
                                                    value={wizardState.description || ''}
                                                    onChange={(e) => setWizardState(prev => ({ ...prev, description: e.target.value }))}
                                                />
                                            </div>

                                            <Button
                                                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 mt-4"
                                                disabled={!wizardState.title || !wizardState.description || wizardState.title.length < 5 || wizardState.description.length < 20}
                                                onClick={() => goToNextStep('review', {})}
                                            >
                                                Continuar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'review' && (
                                    <div className="space-y-8 py-4 max-w-md mx-auto">
                                        <div className="space-y-3 text-center">
                                            <h2 className="text-3xl font-black tracking-tight">Tudo pronto?</h2>
                                            <p className="text-muted-foreground font-medium">Revise as informações antes de enviar para a comunidade votar.</p>
                                        </div>

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

                                        <Button
                                            className="w-full h-16 rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 gap-3"
                                            onClick={handleSubmit}
                                        >
                                            <Send className="h-6 w-6" />
                                            Publicar Sugestão
                                        </Button>
                                    </div>
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
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
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
