'use client';

import { useState } from 'react';
import { Sparkles, List, MessageSquare, Search, Loader2, Check, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizAction } from '@/components/client/quiz/QuizAction';
import { QuizSkillPicker } from '@/components/client/quiz/QuizSkillPicker';
import { QuizTextInput } from '@/components/client/quiz/QuizTextInput';
import { useBnccThemes, useBnccSkills } from '@/hooks/use-taxonomy';
import { Button } from '@/components/ui/button';

interface SkillSelection {
    code: string;
    description: string;
    role: 'main' | 'complementary';
}

interface MomentContentData {
    intentRaw?: string;
    selectedSkills: SkillSelection[];
}

interface MomentContentProps {
    educationLevelSlug: string;
    gradeSlug: string;
    subjectSlug: string;
    data: MomentContentData;
    onChange: (updates: Partial<MomentContentData>) => void;
    onContinue: () => void;
}

type Tab = 'skills' | 'describe';

/**
 * Momento 2: O que será trabalhado
 * Duas opções: Escolher habilidades OU descrever intenção
 */
export function MomentContent({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    data,
    onChange,
    onContinue
}: MomentContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('skills');
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

    // Estado para busca manual (só busca quando o usuário clica no botão)
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

    const isEI = educationLevelSlug === 'educacao-infantil';

    // Sugestões curadas
    const { data: themes = [], isLoading: loadingThemes } = useBnccThemes({
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
    });

    // Busca de skills por texto (só quando searchTerm é definido via botão)
    const { data: suggestedSkills = [], isLoading: loadingSkillSearch, isFetching } = useBnccSkills({
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
        theme: searchTerm,
        limit: 5,
        searchMode: 'hybrid',
    });

    const handleIntentChange = (value: string) => {
        onChange({ intentRaw: value });
        // Não dispara busca automaticamente
    };

    const handleSearchSkills = () => {
        if (data.intentRaw && data.intentRaw.length >= 3) {
            setSearchTerm(data.intentRaw);
            setShowSkillSuggestions(true);
        }
    };

    const handleThemeClick = (theme: string) => {
        onChange({ intentRaw: theme });
        setShowSkillSuggestions(true);
    };

    const handleToggleSkill = (skill: { code: string; description: string }) => {
        const existingIndex = data.selectedSkills.findIndex(s => s.code === skill.code);

        if (existingIndex !== -1) {
            // Se já existe, remove
            handleRemoveSkill(skill.code);
            return;
        }

        // Se não existe, adiciona (mantendo o limite de 3)
        if (data.selectedSkills.length < 3) {
            const hasMain = data.selectedSkills.some(s => s.role === 'main');
            const newSkill: SkillSelection = {
                ...skill,
                role: hasMain ? 'complementary' : 'main'
            };
            onChange({ selectedSkills: [...data.selectedSkills, newSkill] });
        }
    };

    const handleRemoveSkill = (code: string) => {
        const updated = data.selectedSkills.filter(s => s.code !== code);
        // Se removeu a principal, promove a primeira complementar
        if (updated.length > 0 && !updated.some(s => s.role === 'main')) {
            updated[0].role = 'main';
        }
        onChange({ selectedSkills: updated });
    };

    // Validação: pelo menos 1 habilidade selecionada
    const isValid = data.selectedSkills.length >= 1;

    return (
        <QuizStep
            title="O que você quer que seus alunos façam ou aprendam nesta aula?"
            description="Escolha habilidades BNCC ou descreva sua intenção."
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
                    <TabButton
                        active={activeTab === 'skills'}
                        onClick={() => setActiveTab('skills')}
                        icon={List}
                        label={isEI ? "Objetivos" : "Habilidades"}
                    />
                    <TabButton
                        active={activeTab === 'describe'}
                        onClick={() => setActiveTab('describe')}
                        icon={MessageSquare}
                        label="Descrever"
                    />
                </div>

                {/* Conteúdo da Tab */}
                {activeTab === 'describe' && (
                    <div className="space-y-5">
                        {/* Sugestões curadas */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <Sparkles className="h-3 w-3" />
                                Sugestões
                            </p>
                            {loadingThemes ? (
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-8 w-24 rounded-full bg-muted/50 animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {themes.slice(0, 5).map((theme, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleThemeClick(theme)}
                                            className={cn(
                                                "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                                                data.intentRaw === theme
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border/50 bg-background hover:border-primary/50"
                                            )}
                                        >
                                            {theme}
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Textarea */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground ml-1">
                                Ou descreva com suas palavras:
                            </p>
                            <textarea
                                value={data.intentRaw || ''}
                                onChange={(e) => handleIntentChange(e.target.value)}
                                placeholder="Descreva o que você quer trabalhar nesta aula..."
                                className="w-full min-h-[100px] p-4 rounded-xl border-2 border-border/50 bg-background text-base font-normal resize-none outline-none transition-all focus:border-primary placeholder:text-muted-foreground/40"
                                maxLength={300}
                            />

                            {/* Botão de buscar habilidades */}
                            <Button
                                onClick={handleSearchSkills}
                                disabled={!data.intentRaw || data.intentRaw.length < 3 || isFetching}
                                variant="outline"
                                className="w-full gap-2"
                            >
                                {isFetching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                {isFetching ? 'Buscando...' : `Buscar ${isEI ? 'objetivos' : 'habilidades'} BNCC`}
                            </Button>
                        </div>

                        {/* Habilidades sugeridas baseadas no texto */}
                        {showSkillSuggestions && searchTerm && (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    {isEI ? 'Objetivos relacionados' : 'Habilidades relacionadas'}
                                </p>
                                {loadingSkillSearch ? (
                                    <div className="space-y-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
                                        ))}
                                    </div>
                                ) : suggestedSkills.length > 0 ? (
                                    <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                                        {suggestedSkills.slice(0, 5).map((skill) => {
                                            const isSelected = data.selectedSkills.some(s => s.code === skill.code);
                                            return (
                                                <button
                                                    key={skill.code}
                                                    onClick={() => handleToggleSkill(skill)}
                                                    disabled={!isSelected && data.selectedSkills.length >= 3}
                                                    className={cn(
                                                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                                                        "flex items-start gap-3",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-border/50 hover:border-primary/50 bg-background"
                                                    )}
                                                >
                                                    {/* Checkbox (estilo QuizSkillPicker) */}
                                                    <div className={cn(
                                                        "h-5 w-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                                                        isSelected ? "border-primary bg-primary" : "border-border"
                                                    )}>
                                                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={cn(
                                                                "text-sm font-bold",
                                                                isSelected ? "text-primary" : "text-foreground"
                                                            )}>
                                                                {skill.code}
                                                            </span>
                                                            {isSelected && data.selectedSkills.find(s => s.code === skill.code)?.role === 'main' && (
                                                                <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded flex items-center gap-1">
                                                                    <Star className="h-2.5 w-2.5 fill-current" />
                                                                    Principal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {skill.description}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Nenhuma habilidade encontrada. Tente outra descrição.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'skills' && (
                    <QuizSkillPicker
                        educationLevelSlug={educationLevelSlug}
                        gradeSlug={gradeSlug}
                        subjectSlug={subjectSlug}
                        selectedSkills={data.selectedSkills}
                        onSelectionChange={(skills) => onChange({ selectedSkills: skills })}
                    />
                )}

                {/* Habilidades selecionadas (Layout Compacto) */}
                {data.selectedSkills.length > 0 && activeTab === 'describe' && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Selecionadas ({data.selectedSkills.length}/3)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {data.selectedSkills.map(skill => (
                                <motion.div
                                    key={skill.code}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                                        skill.role === 'main'
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "bg-muted text-foreground border border-border/50"
                                    )}
                                >
                                    {skill.role === 'main' && <Star className="h-3 w-3 fill-current" />}
                                    <span className="font-bold">{skill.code}</span>
                                    <button
                                        onClick={() => handleRemoveSkill(skill.code)}
                                        className="ml-1 hover:opacity-70 transition-opacity"
                                        title="Remover"
                                    >
                                        <X className="h-3 w-3 border border-current rounded-full p-[1px]" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botão Continuar */}
                <QuizAction
                    label="Continuar"
                    onClick={onContinue}
                    disabled={!isValid}
                />

                {!isValid && (
                    <p className="text-xs text-muted-foreground text-center">
                        Selecione pelo menos 1 {isEI ? 'objetivo' : 'habilidade'} para continuar.
                    </p>
                )}
            </div>
        </QuizStep>
    );
}

// Componente auxiliar para as tabs
function TabButton({
    active,
    onClick,
    icon: Icon,
    label
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                active
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}
