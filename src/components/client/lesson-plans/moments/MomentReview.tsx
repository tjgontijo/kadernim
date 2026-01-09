'use client';

import { useState, useEffect } from 'react';
import { Pencil, Check, Star, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizAction } from '@/components/client/quiz/QuizAction';

interface SkillSelection {
    code: string;
    description: string;
    role: 'main' | 'complementary';
}

interface MomentReviewData {
    // Contexto
    educationLevelSlug?: string;
    educationLevelName?: string;
    gradeSlug?: string;
    gradeName?: string;
    subjectSlug?: string;
    subjectName?: string;
    numberOfClasses?: number;
    // Conteúdo
    intentRaw?: string;
    selectedSkills: SkillSelection[];
    // Editáveis
    title?: string;
}

interface MomentReviewProps {
    data: MomentReviewData;
    onChange: (updates: Partial<MomentReviewData>) => void;
    onGenerate: () => void;
    isGenerating?: boolean;
}

/**
 * Momento 3: Revisão e Geração
 * Mostra resumo do plano com campos editáveis
 */
export function MomentReview({
    data,
    onChange,
    onGenerate,
    isGenerating = false
}: MomentReviewProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(data.title || '');
    const [generatingTheme, setGeneratingTheme] = useState(false);
    const [themeAttempts, setThemeAttempts] = useState(0);
    const MAX_THEME_ATTEMPTS = 5;

    const mainSkill = data.selectedSkills.find(s => s.role === 'main');
    const complementarySkills = data.selectedSkills.filter(s => s.role === 'complementary');

    // Título para exibição: se não definido, mostrar que será gerado
    const displayTitle = data.title || data.intentRaw || 'Será gerado automaticamente';

    // Sincronizar titleDraft quando data.title muda (após gerar tema)
    useEffect(() => {
        if (data.title && !editingTitle) {
            setTitleDraft(data.title);
        }
    }, [data.title, editingTitle]);

    // Gerar tema inicial automaticamente se não houver título
    useEffect(() => {
        const shouldGenerateInitialTheme = !data.title &&
            !data.intentRaw &&
            mainSkill &&
            themeAttempts === 0 &&
            !generatingTheme;

        if (shouldGenerateInitialTheme) {
            handleGenerateTheme();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Apenas na montagem do componente


    const handleSaveTitle = () => {
        onChange({ title: titleDraft || displayTitle });
        setEditingTitle(false);
    };

    const handleSetAsMain = (code: string) => {
        // Trocar roles: o clicado vira principal, o atual principal vira complementar
        const updatedSkills = data.selectedSkills.map(skill => ({
            ...skill,
            role: skill.code === code ? 'main' as const : 'complementary' as const
        }));
        onChange({ selectedSkills: updatedSkills });
    };

    const handleGenerateTheme = async () => {
        if (themeAttempts >= MAX_THEME_ATTEMPTS || !mainSkill) return;

        setGeneratingTheme(true);
        setThemeAttempts(prev => prev + 1);

        try {
            // Chamar API para gerar tema
            const response = await fetch('/api/v1/lesson-plans/generate-theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    educationLevelSlug: data.educationLevelSlug,
                    gradeSlug: data.gradeSlug,
                    subjectSlug: data.subjectSlug,
                    mainSkillCode: mainSkill.code,
                    mainSkillDescription: mainSkill.description,
                    intentRaw: data.intentRaw,
                }),
            });

            const result = await response.json();

            if (result.success && result.data?.theme) {
                onChange({ title: result.data.theme });
            } else {
                throw new Error(result.error || 'Erro ao gerar tema');
            }
        } catch (error) {
            console.error('Erro ao gerar tema:', error);
            // Silenciosamente falha, usuário pode tentar novamente
        } finally {
            setGeneratingTheme(false);
        }
    };

    const isValid = data.selectedSkills.length >= 1;

    return (
        <QuizStep
            title="Revise e gere seu plano"
            description="O tema e a estrutura serão gerados automaticamente. Você pode editar qualquer campo."
        >
            <div className="space-y-6">
                {/* Aviso */}
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                        O tema e a estrutura da aula serão gerados automaticamente com base nas suas escolhas.
                        Você poderá editar tudo depois.
                    </p>
                </div>

                {/* Card de Resumo */}
                <div className="bg-background border-2 border-border/50 rounded-2xl overflow-hidden">
                    {/* Tema (editável com geração por IA) */}
                    <div className="p-4 border-b border-border/30">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Tema da Aula
                            </span>
                            {!editingTitle && (
                                <div className="flex items-center gap-2">
                                    {/* Botão Refresh - Gerar novo tema */}
                                    <button
                                        onClick={handleGenerateTheme}
                                        disabled={generatingTheme || themeAttempts >= MAX_THEME_ATTEMPTS}
                                        className={cn(
                                            "text-xs flex items-center gap-1 transition-colors",
                                            generatingTheme || themeAttempts >= MAX_THEME_ATTEMPTS
                                                ? "text-muted-foreground cursor-not-allowed"
                                                : "text-primary hover:underline"
                                        )}
                                        title={themeAttempts >= MAX_THEME_ATTEMPTS ? "Limite de tentativas atingido" : "Gerar novo tema com IA"}
                                    >
                                        {generatingTheme ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-3 w-3" />
                                        )}
                                        {generatingTheme ? "Gerando..." : `Gerar (${themeAttempts}/${MAX_THEME_ATTEMPTS})`}
                                    </button>

                                    {/* Botão Editar */}
                                    <button
                                        onClick={() => {
                                            setTitleDraft(data.title || displayTitle);
                                            setEditingTitle(true);
                                        }}
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>

                        {editingTitle ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={titleDraft}
                                    onChange={(e) => setTitleDraft(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border-2 border-primary bg-background text-sm font-medium outline-none"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                                />
                                <button
                                    onClick={handleSaveTitle}
                                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-base font-semibold text-foreground">
                                    {displayTitle}
                                </p>
                                {/* Mensagem quando atingir limite */}
                                {themeAttempts >= MAX_THEME_ATTEMPTS && (
                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                        Infelizmente não conseguimos encontrar um tema que lhe agrade.
                                        Selecione a opção de editar e ajuste do seu gosto.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Contexto */}
                    <div className="p-4 border-b border-border/30 grid grid-cols-2 gap-4">
                        <InfoItem label="Etapa" value={data.educationLevelName} />
                        <InfoItem label="Ano" value={data.gradeName} />
                        <InfoItem label="Disciplina" value={data.subjectName} />
                        <InfoItem
                            label="Duração"
                            value={data.numberOfClasses ? `${data.numberOfClasses} aula${data.numberOfClasses > 1 ? 's' : ''}` : undefined}
                        />
                    </div>

                    {/* Habilidades BNCC */}
                    <div className="p-4">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-3">
                            Habilidades BNCC
                        </span>

                        <div className="space-y-3">
                            {/* Principal */}
                            {mainSkill && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-primary/5 rounded-xl border border-primary/20"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star className="h-4 w-4 text-primary fill-current" />
                                        <span className="text-xs font-bold text-primary uppercase">
                                            Principal
                                        </span>
                                        <span className="text-sm font-bold text-primary">
                                            {mainSkill.code}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {mainSkill.description}
                                    </p>
                                </motion.div>
                            )}

                            {/* Complementares - com botão para tornar principal */}
                            {complementarySkills.map((skill, index) => (
                                <motion.div
                                    key={skill.code}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (index + 1) * 0.1 }}
                                    className="p-3 bg-muted/30 rounded-xl"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">
                                                Complementar
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {skill.code}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleSetAsMain(skill.code)}
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Star className="h-3 w-3" />
                                            Tornar principal
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {skill.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Intenção original (se preenchida) */}
                {data.intentRaw && (
                    <div className="p-4 bg-muted/20 rounded-xl">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Sua descrição
                        </span>
                        <p className="text-sm text-foreground italic">
                            "{data.intentRaw}"
                        </p>
                    </div>
                )}

                {/* Botão Gerar */}
                <QuizAction
                    label={isGenerating ? "Gerando seu plano..." : "Gerar Plano de Aula"}
                    onClick={onGenerate}
                    disabled={!isValid || isGenerating}
                    loading={isGenerating}
                    icon={isGenerating ? Loader2 : undefined}
                />
            </div>
        </QuizStep>
    );
}

// Componente auxiliar
function InfoItem({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <span className="text-xs text-muted-foreground block mb-0.5">{label}</span>
            <span className={cn(
                "text-sm font-medium",
                value ? "text-foreground" : "text-muted-foreground/50"
            )}>
                {value || '—'}
            </span>
        </div>
    );
}
