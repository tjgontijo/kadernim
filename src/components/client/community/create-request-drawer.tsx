'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
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
    bnccSkillDescription?: string;

    // Content
    title?: string;
    description?: string;
    attachments?: File[];
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

            const formData = new FormData();
            formData.append('title', wizardState.title || '');
            formData.append('description', wizardState.description || '');
            formData.append('hasBnccAlignment', String(!!wizardState.hasBnccAlignment));

            if (wizardState.hasBnccAlignment) {
                if (wizardState.educationLevelId) formData.append('educationLevelId', wizardState.educationLevelId);
                if (wizardState.gradeId) formData.append('gradeId', wizardState.gradeId);
                if (wizardState.subjectId) formData.append('subjectId', wizardState.subjectId);
                if (wizardState.bnccSkillCodes) {
                    wizardState.bnccSkillCodes.forEach(code => formData.append('bnccSkillCodes', code));
                }
            }

            if (wizardState.attachments) {
                wizardState.attachments.forEach(file => formData.append('attachments', file));
            }

            const response = await fetch('/api/v1/community/requests', {
                method: 'POST',
                body: formData,
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
                            onChange={(updates) => setWizardState(prev => ({
                                ...prev,
                                bnccSkillCodes: updates.codes,
                                bnccSkillDescription: updates.description
                            }))}
                            onContinue={() => goToNextStep('content', {})}
                        />
                    )}

                    {/* 4. Conteúdo (Título + Descrição + Upload) */}
                    {currentStep === 'content' && (
                        <QuestionContent
                            title={wizardState.title || ''}
                            description={wizardState.description || ''}
                            attachments={wizardState.attachments || []}
                            maxFiles={config?.uploads?.maxFiles || 5}
                            maxSizeMB={config?.uploads?.maxSizeMB || 2}
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
                            <div className="space-y-12 mb-10 pb-6 pr-2">
                                {/* Seção 1: Contexto Pedagógico */}
                                {wizardState.hasBnccAlignment && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-primary tracking-tight">Contexto Pedagógico</h4>
                                            <div className="flex-1 h-px bg-primary/10" />
                                        </div>

                                        <div className="space-y-8 pl-1">
                                            {/* Etapa, Ano e Disciplina Empilhados */}
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">Etapa de Ensino</div>
                                                    <div className="text-base font-semibold text-foreground">{wizardState.educationLevelName}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">Ano / Faixa Etária</div>
                                                    <div className="text-base font-semibold text-foreground">{wizardState.gradeName}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">Componente Curricular</div>
                                                    <div className="text-base font-semibold text-foreground">{wizardState.subjectName}</div>
                                                </div>
                                            </div>

                                            {/* Habilidade Principal - Clean Display */}
                                            {wizardState.bnccSkillCodes && wizardState.bnccSkillCodes.length > 0 && (
                                                <div className="space-y-3 pt-4 border-t border-border/50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">Habilidade Principal</div>
                                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
                                                            {wizardState.bnccSkillCodes[0]}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground leading-relaxed">
                                                        {wizardState.bnccSkillDescription}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Seção 2: Detalhes do Pedido */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-primary tracking-tight">Detalhes da Sugestão</h4>
                                        <div className="flex-1 h-px bg-primary/10" />
                                        {!wizardState.hasBnccAlignment && (
                                            <span className="text-[9px] font-bold uppercase tracking-widest bg-muted px-2 py-0.5 rounded text-muted-foreground">Material Geral</span>
                                        )}
                                    </div>

                                    <div className="space-y-8 pl-1">
                                        {/* Título */}
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">Título do Material</div>
                                            <div className="text-xl font-bold text-foreground leading-tight">
                                                {wizardState.title}
                                            </div>
                                        </div>

                                        {/* Descrição */}
                                        <div className="space-y-2">
                                            <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">O que você precisa</div>
                                            <div className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {wizardState.description}
                                            </div>
                                        </div>

                                        {/* Anexos */}
                                        {wizardState.attachments && wizardState.attachments.length > 0 && (
                                            <div className="space-y-3 pt-4 border-t border-border/50">
                                                <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">Referências Anexadas</div>
                                                <div className="flex flex-col gap-2">
                                                    {wizardState.attachments.map((file, i) => (
                                                        <div key={i} className="flex items-center gap-2.5 py-1 text-sm font-medium text-foreground/80">
                                                            <CheckCircle2 className="h-4 w-4 text-primary/40 shrink-0" />
                                                            <span className="truncate flex-1">{file.name}</span>
                                                            <span className="text-[10px] text-muted-foreground/40 font-mono italic">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <QuizAction
                                label="Enviar Sugestão"
                                icon={Send}
                                onClick={handleSubmit}
                            />
                        </QuizStep>
                    )}

                    {/* Submitting */}
                    {currentStep === 'submitting' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <h2 className="text-2xl font-bold">Enviando seu pedido...</h2>
                        </div>
                    )}

                    {/* Success */}
                    {currentStep === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 text-center px-6">
                            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Sparkles className="h-12 w-12 fill-current" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-bold">Sugestão Enviada!</h2>
                                <p className="text-xl text-muted-foreground font-medium">
                                    Agora é com a comunidade. Divulgue seu pedido para ganhar votos!
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="h-16 px-12 rounded-2xl font-bold text-xl"
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
