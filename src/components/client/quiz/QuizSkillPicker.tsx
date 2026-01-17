'use client';

import { useState, useMemo } from 'react';
import { Search, Check, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { motion, AnimatePresence } from 'framer-motion';
import { useBnccSkills } from '@/hooks/entities/use-taxonomy';

interface SkillSelection {
    code: string;
    description: string;
    role: 'main' | 'complementary';
}

interface QuizSkillPickerProps {
    educationLevelSlug: string;
    gradeSlug: string;
    subjectSlug: string;
    selectedSkills: SkillSelection[];
    onSelectionChange: (skills: SkillSelection[]) => void;
    maxComplementary?: number;
}

/**
 * Componente para buscar e selecionar habilidades BNCC
 * - Lista filtrada por contexto
 * - Busca em código e descrição
 * - Seleção: 1 principal + até 2 complementares
 */
export function QuizSkillPicker({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    selectedSkills,
    onSelectionChange,
    maxComplementary = 2
}: QuizSkillPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: skills = [], isLoading } = useBnccSkills({
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
        limit: 50,
    });

    // Filtrar por busca local
    const filteredSkills = useMemo(() => {
        if (!searchQuery.trim()) return skills;
        const query = searchQuery.toLowerCase();
        return skills.filter(skill =>
            skill.code.toLowerCase().includes(query) ||
            skill.description.toLowerCase().includes(query)
        );
    }, [skills, searchQuery]);

    const isSelected = (code: string) => selectedSkills.some(s => s.code === code);
    const getRole = (code: string) => selectedSkills.find(s => s.code === code)?.role;
    const mainSkill = selectedSkills.find(s => s.role === 'main');
    const complementaryCount = selectedSkills.filter(s => s.role === 'complementary').length;

    const handleToggleSkill = (skill: { code: string; description: string }) => {
        const existing = selectedSkills.find(s => s.code === skill.code);

        if (existing) {
            // Remover
            onSelectionChange(selectedSkills.filter(s => s.code !== skill.code));
        } else {
            // Adicionar
            if (!mainSkill) {
                // Primeira seleção vira principal
                onSelectionChange([...selectedSkills, { ...skill, role: 'main' }]);
            } else if (complementaryCount < maxComplementary) {
                // Adicionar como complementar
                onSelectionChange([...selectedSkills, { ...skill, role: 'complementary' }]);
            }
            // Se já tem principal e atingiu limite de complementares, não faz nada
        }
    };

    const handleSetAsMain = (code: string) => {
        onSelectionChange(selectedSkills.map(s => ({
            ...s,
            role: s.code === code ? 'main' : 'complementary'
        })));
    };

    const handleRemove = (code: string) => {
        const newSkills = selectedSkills.filter(s => s.code !== code);
        // Se removeu a principal e ainda tem outras, promove a primeira para principal
        if (!newSkills.some(s => s.role === 'main') && newSkills.length > 0) {
            newSkills[0].role = 'main';
        }
        onSelectionChange(newSkills);
    };

    const isEI = educationLevelSlug === 'educacao-infantil';
    const skillLabel = isEI ? 'Objetivo de Aprendizagem' : 'Habilidade BNCC';

    return (
        <div className="space-y-4">
            {/* Campo de busca */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Buscar por código ou descrição...`}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-border/50 bg-background text-sm font-normal outline-none transition-all focus:border-primary placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Skills selecionadas */}
            <AnimatePresence>
                {selectedSkills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Selecionadas ({selectedSkills.length}/{maxComplementary + 1})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedSkills.map((skill) => (
                                <motion.div
                                    key={skill.code}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                                        skill.role === 'main'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground"
                                    )}
                                >
                                    {skill.role === 'main' && <Star className="h-3 w-3 fill-current" />}
                                    <span>{skill.code}</span>
                                    <button
                                        onClick={() => handleRemove(skill.code)}
                                        className="ml-1 hover:opacity-70"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lista de habilidades */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-thin pr-1">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
                    ))
                ) : filteredSkills.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        {searchQuery ? 'Nenhuma habilidade encontrada.' : 'Nenhuma habilidade disponível.'}
                    </div>
                ) : (
                    filteredSkills.map((skill) => {
                        const selected = isSelected(skill.code);
                        const role = getRole(skill.code);
                        const canSelect = !selected && (selectedSkills.length < maxComplementary + 1);

                        return (
                            <button
                                key={skill.code}
                                onClick={() => handleToggleSkill(skill)}
                                disabled={!canSelect && !selected}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                                    "flex items-start gap-3",
                                    selected
                                        ? "border-primary bg-primary/5"
                                        : canSelect
                                            ? "border-border/50 hover:border-primary/50 bg-background"
                                            : "border-border/30 bg-muted/20 opacity-50 cursor-not-allowed"
                                )}
                            >
                                {/* Checkbox */}
                                <div className={cn(
                                    "h-5 w-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                                    selected ? "border-primary bg-primary" : "border-border"
                                )}>
                                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                                </div>

                                {/* Conteúdo */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            selected ? "text-primary" : "text-foreground"
                                        )}>
                                            {skill.code}
                                        </span>
                                        {role === 'main' && (
                                            <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded">
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
                    })
                )}
            </div>

            {/* Dica */}
            {selectedSkills.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    Selecione 1 {skillLabel.toLowerCase()} principal e até {maxComplementary} complementares.
                </p>
            )}
        </div>
    );
}
