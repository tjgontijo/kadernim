'use client';

import { LucideIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizCard } from './QuizCard';
import { QuizAction } from './QuizAction';

export interface QuizOption {
    id: string;
    slug: string;
    name: string;
    description?: string;
    icon?: LucideIcon;
}

interface QuizChoiceProps {
    options: QuizOption[];
    value?: string | string[];
    onSelect: (option: QuizOption) => void;
    multiple?: boolean;
    loading?: boolean;
    autoAdvance?: boolean;
    onContinue?: () => void;
    continueLabel?: string;
    minSelection?: number;
    maxSelection?: number;
    showCounter?: boolean;
}

export function QuizChoice({
    options,
    value,
    onSelect,
    multiple = false,
    loading = false,
    autoAdvance = true,
    onContinue,
    continueLabel = 'Continuar',
    minSelection = 1,
    maxSelection,
    showCounter = false,
}: QuizChoiceProps) {
    const isSelected = (slug: string) => {
        if (multiple && Array.isArray(value)) {
            return value.includes(slug);
        }
        return value === slug;
    };

    const handleSelect = (option: QuizOption) => {
        const selected = isSelected(option.slug);

        // If multiple, check if we can select more
        if (multiple && !selected && maxSelection && Array.isArray(value) && value.length >= maxSelection) {
            return;
        }

        onSelect(option);

        if (!multiple && autoAdvance && onContinue) {
            setTimeout(() => {
                onContinue();
            }, 400);
        }
    };

    const selectedCount = multiple && Array.isArray(value) ? value.length : (value ? 1 : 0);
    const hasSelection = selectedCount >= minSelection;
    const isMaxReached = multiple && maxSelection && selectedCount >= maxSelection;

    return (
        <div className="space-y-6 w-full">
            {multiple && showCounter && (
                <div className="text-center animate-in fade-in slide-in-from-top-2 duration-500">
                    <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        <span className={cn(selectedCount >= minSelection ? 'text-primary' : '')}>
                            {selectedCount}
                        </span>
                        {maxSelection ? ` de ${maxSelection}` : ''} selecionadas
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 rounded-[20px] bg-muted/20 animate-pulse border-2 border-transparent"
                        />
                    ))
                ) : (
                    options.map((option) => {
                        const selected = isSelected(option.slug);
                        const disabled = !selected && isMaxReached;

                        return (
                            <QuizCard
                                key={option.slug}
                                title={option.name}
                                description={option.description}
                                icon={option.icon}
                                selected={selected}
                                onClick={() => handleSelect(option)}
                                compact={options.length > 6}
                                className={cn(
                                    disabled && "opacity-50 grayscale pointer-events-none"
                                )}
                            />
                        );
                    })
                )}
            </div>

            <AnimatePresence>
                {(multiple || (hasSelection && !autoAdvance)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="pt-4"
                    >
                        <QuizAction
                            label={continueLabel}
                            onClick={onContinue || (() => { })}
                            disabled={!hasSelection}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
