'use client';

import { useState, useMemo } from 'react';
import { useBnccSkills } from '@/hooks/use-taxonomy';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizChoice } from '@/components/client/quiz/QuizChoice';
import { Search, X, Loader2, Info, Sparkles, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuestionBnccSkillsProps {
    educationLevelSlug: string;
    gradeSlug: string;
    subjectSlug: string;
    selectedSkills: string[];
    onChange: (updates: { codes: string[], description?: string }) => void;
    onContinue: () => void;
}

export function QuestionBnccSkills({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    selectedSkills,
    onChange,
    onContinue
}: QuestionBnccSkillsProps) {
    const [search, setSearch] = useState('');

    const { data: skills, isLoading, error } = useBnccSkills({
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
        limit: 100,
        searchMode: 'text'
    });

    const filteredSkills = useMemo(() => {
        if (!skills) return [];
        if (!search.trim()) return skills;

        const term = search.toLowerCase();
        return skills.filter(s =>
            s.code.toLowerCase().includes(term) ||
            s.description.toLowerCase().includes(term)
        );
    }, [skills, search]);

    const quizOptions = filteredSkills.map(skill => ({
        id: skill.code,
        slug: skill.code,
        name: skill.code,
        description: skill.description
    }));

    const handleSelect = (opt: any) => {
        onChange({ codes: [opt.slug], description: opt.description });
        // Auto-advance is handled by QuizChoice when multiple=false
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-10 py-12 px-6">
                <div className="relative">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative"
                    >
                        <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-bold">Buscando BNCC...</h2>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed uppercase tracking-widest text-[10px]">
                        Preparando lista de habilidades disponíveis para você
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <QuizStep
                title="Ops! Algo deu errado"
                description="Não foi possível carregar as habilidades agora."
            >
                <div className="text-center py-8">
                    <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl h-12 px-8 font-bold">
                        Tentar novamente
                    </Button>
                </div>
            </QuizStep>
        );
    }

    return (
        <QuizStep
            title="Qual a habilidade principal?"
            description={search ? `Encontramos ${filteredSkills.length} resultados` : "Selecione a habilidade principal da BNCC para este material."}
        >
            <div className="flex flex-col gap-6">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        className="h-14 pl-12 pr-12 bg-muted/10 border border-border/60 rounded-2xl font-semibold text-base focus:border-primary focus:bg-background transition-all outline-none"
                        placeholder="Ex: EF01MA01 ou 'frações'..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {skills && skills.length === 0 ? (
                    <Alert className="rounded-2xl border-2">
                        <Info className="h-5 w-5" />
                        <AlertDescription className="font-medium">
                            Não encontramos habilidades BNCC para este filtro. Verifique a etapa e disciplina selecionadas.
                        </AlertDescription>
                    </Alert>
                ) : filteredSkills.length === 0 && search ? (
                    <div className="py-12 text-center space-y-4">
                        <p className="text-muted-foreground font-medium">Nenhum resultado para "{search}"</p>
                        <Button variant="ghost" onClick={() => setSearch('')} className="text-primary font-bold">Limpar busca</Button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={search ? 'search' : 'list'}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <QuizChoice
                                options={quizOptions}
                                value={selectedSkills[0]}
                                onSelect={handleSelect}
                                multiple={false}
                                onContinue={onContinue}
                                autoAdvance={true}
                                continueLabel="Confirmar Habilidade"
                            />
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </QuizStep>
    );
}
