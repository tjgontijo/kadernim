'use client';

import { cn } from '@/lib/utils/index';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizSelectOption {
    value: string;
    label: string;
    description?: string;
}

interface QuizSelectProps {
    label: string;
    placeholder?: string;
    options: QuizSelectOption[];
    value?: string;
    onChange: (value: string, label: string) => void;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
}

/**
 * Select estilizado para o wizard
 * Mobile-first, compacto, com animações
 */
export function QuizSelect({
    label,
    placeholder = 'Selecione...',
    options,
    value,
    onChange,
    loading = false,
    disabled = false,
    className
}: QuizSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (option: QuizSelectOption) => {
        onChange(option.value, option.label);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)}>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                {label}
            </label>

            <button
                type="button"
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className={cn(
                    "w-full h-12 px-4 rounded-xl border-2 transition-all",
                    "flex items-center justify-between gap-2",
                    "text-left text-base font-medium",
                    "bg-background",
                    isOpen ? "border-primary shadow-sm" : "border-border/50 hover:border-border",
                    disabled && "opacity-50 cursor-not-allowed",
                    loading && "animate-pulse"
                )}
            >
                <span className={cn(
                    selectedOption ? "text-foreground" : "text-muted-foreground"
                )}>
                    {loading ? 'Carregando...' : selectedOption?.label || placeholder}
                </span>
                <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay para fechar */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 w-full mt-2 py-2 bg-background border-2 border-border/50 rounded-xl shadow-lg max-h-60 overflow-y-auto scrollbar-thin"
                        >
                            {options.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                    Nenhuma opção disponível
                                </div>
                            ) : (
                                options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={cn(
                                            "w-full px-4 py-3 text-left transition-colors",
                                            "flex items-center justify-between gap-2",
                                            "hover:bg-muted/50",
                                            option.value === value && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                option.value === value && "text-primary"
                                            )}>
                                                {option.label}
                                            </span>
                                            {option.description && (
                                                <span className="text-xs text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            )}
                                        </div>
                                        {option.value === value && (
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
