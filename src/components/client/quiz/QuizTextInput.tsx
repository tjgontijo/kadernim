'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizAction } from './QuizAction';
import { Loader2 } from 'lucide-react';

interface QuizTextInputProps {
    value: string;
    onChange: (value: string) => void;
    onContinue: () => void;
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
    multiline?: boolean;
    autoFocus?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    type?: 'text' | 'number' | 'email';
}

export function QuizTextInput({
    value,
    onChange,
    onContinue,
    placeholder,
    minLength = 3,
    maxLength = 500,
    multiline = false,
    autoFocus = true,
    isLoading = false,
    loadingText = 'Processando...',
    type = 'text',
}: QuizTextInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isValid = value.length >= minLength && value.length <= maxLength;
    const charCount = value.length;

    useEffect(() => {
        if (autoFocus) {
            const timer = setTimeout(() => {
                if (multiline) {
                    textareaRef.current?.focus();
                } else {
                    inputRef.current?.focus();
                }
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [autoFocus, multiline]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!multiline && e.key === 'Enter' && isValid && !isLoading) {
            e.preventDefault();
            onContinue();
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="relative group">
                {multiline ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={cn(
                            "w-full min-h-[140px] bg-muted/20 border-2 border-border/40 rounded-[16px] p-5 text-base font-normal outline-none transition-all",
                            "focus:border-primary focus:bg-background focus:shadow-sm placeholder:text-muted-foreground/40",
                            "scrollbar-none resize-none"
                        )}
                        onKeyDown={handleKeyDown}
                    />
                ) : (
                    <input
                        ref={inputRef}
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={cn(
                            "w-full h-12 bg-muted/20 border-2 border-border/40 rounded-[12px] px-5 text-base font-normal outline-none transition-all",
                            "focus:border-primary focus:bg-background focus:shadow-sm placeholder:text-muted-foreground/40"
                        )}
                        onKeyDown={handleKeyDown}
                    />
                )}

                <div className="absolute bottom-3 right-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
                    {charCount} / {maxLength}
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {charCount > 0 && charCount < minLength && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[10px] font-bold text-primary/70 text-center uppercase tracking-widest"
                        >
                            Escreva mais {minLength - charCount} caracteres
                        </motion.p>
                    )}
                </AnimatePresence>

                <QuizAction
                    label={isLoading ? loadingText : 'Continuar'}
                    onClick={onContinue}
                    disabled={!isValid || isLoading}
                    icon={isLoading ? Loader2 : undefined}
                />

                {!multiline && isValid && !isLoading && (
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 text-center">
                        Pressione Enter para prosseguir
                    </p>
                )}
            </div>
        </div>
    );
}
