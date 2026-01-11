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

import { QuestionBnccAlignment } from './questions/question-bncc-alignment';
import { QuestionTaxonomy } from './questions/question-taxonomy';
import { QuestionBnccSkills } from './questions/question-bncc-skills';
import { QuestionContent } from './questions/question-content';
import { useCommunityConfig } from '@/hooks/use-community-config';

/**
 * Wizard state interface - Atualizada Fase 03
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

    // BNCC Integration
    hasBnccAlignment?: boolean;
    bnccSkillCodes?: string[];

    // Content
    title?: string;
    description?: string;
}

/**
 * Question step type - Novo Fluxo Fase 03
 */
export type CommunityStep =
    | 'bncc-alignment'
    | 'taxonomy'
    | 'bncc-skills'
    | 'content'
    | 'review'
    | 'submitting'
    | 'success';

interface CreateRequestDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateRequestDrawer({ open, onOpenChange }: CreateRequestDrawerProps) {
    const queryClient = useQueryClient();
    const { data: config } = useCommunityConfig();

    const [currentStep, setCurrentStep] = useState<CommunityStep>('bncc-alignment');
    const [wizardState, setWizardState] = useState<CommunityWizardState>({});
    const [history, setHistory] = useState<CommunityStep[]>(['bncc-alignment']);

    const totalSteps = wizardState.hasBnccAlignment ? 5 : 3;
    const stepNumber = getStepNumber(currentStep, !!wizardState.hasBnccAlignment);

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
                    hasBnccAlignment: wizardState.hasBnccAlignment,
                    educationLevelId: wizardState.educationLevelId,
                    gradeId: wizardState.gradeId,
                    subjectId: wizardState.subjectId,
                    bnccSkillCodes: wizardState.bnccSkillCodes || [],
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
        setCurrentStep('bncc-alignment');
        setWizardState({});
        setHistory(['bncc-alignment']);
        onOpenChange(false);
    };

    const canGoBack = history.length > 1 &&
        currentStep !== 'submitting' &&
        currentStep !== 'success';

    return (
        <QuizLayout
            open={open}
            onClose={handleClose}
            title="Sugerir Novo Material"
            currentStep={stepNumber}
            totalSteps={totalSteps}
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
                    {/* 1. Alinhamento BNCC? */}
                    {currentStep === 'bncc-alignment' && (
                        <QuestionBnccAlignment
                            onSelect={(hasAlignment) => {
                                if (hasAlignment) {
                                    goToNextStep('taxonomy', { hasBnccAlignment: true });
                                } else {
                                    goToNextStep('content', {
                                        hasBnccAlignment: false,
                                        educationLevelId: undefined,
                                        gradeId: undefined,
                                        subjectId: undefined,
                                        bnccSkillCodes: []
                                    });
                                }
                            }}
                        />
                    )}

                    {/* 2. Taxonomia (Fluxo BNCC) */}
                    {currentStep === 'taxonomy' && (
                        <QuestionTaxonomy
                            educationLevelSlug={wizardState.educationLevelSlug}
                            gradeSlug={wizardState.gradeSlug}
                            subjectSlug={wizardState.subjectSlug}
                            onChange={(updates) => setWizardState(prev => ({ ...prev, ...updates }))}
                            onContinue={() => goToNextStep('bncc-skills', {})}
                        />
                    )}

                    {/* 3. BNCC Skills (Fluxo BNCC) */}
                    {currentStep === 'bncc-skills' && (
                        <QuestionBnccSkills
                            educationLevelSlug={wizardState.educationLevelSlug!}
                            gradeSlug={wizardState.gradeSlug!}
                            subjectSlug={wizardState.subjectSlug!}
                            selectedSkills={wizardState.bnccSkillCodes || []}
                            maxSkills={config?.bncc?.maxSkills || 5}
                            onChange={(skills) => setWizardState(prev => ({ ...prev, bnccSkillCodes: skills }))}
                            onContinue={() => goToNextStep('content', {})}
                        />
                    )}

                    {/* 4. Conteúdo (Título + Descrição) */}
                    {currentStep === 'content' && (
                        <QuestionContent
                            title={wizardState.title || ''}
                            description={wizardState.description || ''}
                            onChange={(updates) => setWizardState(prev => ({ ...prev, ...updates }))}
                            onContinue={() => goToNextStep('review', {})}
                        />
                    )}

                    {/* 5. Revisão Final */}
                    {currentStep === 'review' && (
                        <QuizStep
                            title="Tudo pronto?"
                            description="Revise as informações antes de enviar."
                        >
                            <div className="bg-muted/30 rounded-[32px] p-6 border-2 border-border/50 space-y-4 mb-6">
                                {wizardState.hasBnccAlignment && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Etapa</div>
                                            <div className="text-sm font-bold truncate">{wizardState.educationLevelName}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Ano</div>
                                            <div className="text-sm font-bold truncate">{wizardState.gradeName}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Disciplina</div>
                                            <div className="text-sm font-bold truncate">{wizardState.subjectName}</div>
                                        </div>
                                    </div>
                                )}

                                {!wizardState.hasBnccAlignment && (
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Material Geral (Sem BNCC)
                                    </div>
                                )}

                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Título</div>
                                    <div className="text-lg font-black">{wizardState.title}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Descrição</div>
                                    <div className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-4">
                                        {wizardState.description}
                                    </div>
                                </div>

                                {wizardState.bnccSkillCodes && wizardState.bnccSkillCodes.length > 0 && (
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Habilidades BNCC</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {wizardState.bnccSkillCodes.map(code => (
                                                <span key={code} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
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

function getStepNumber(step: CommunityStep, hasBncc: boolean): number {
    if (!hasBncc) {
        const stepMap: Partial<Record<CommunityStep, number>> = {
            'bncc-alignment': 1,
            'content': 2,
            'review': 3,
            'submitting': 3,
            'success': 3,
        };
        return stepMap[step] || 1;
    }

    const stepMap: Record<CommunityStep, number> = {
        'bncc-alignment': 1,
        'taxonomy': 2,
        'bncc-skills': 3,
        'content': 4,
        'review': 5,
        'submitting': 5,
        'success': 5,
    };
    return stepMap[step] || 1;
}
