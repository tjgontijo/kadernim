'use client';

import { useEffect, useRef } from 'react';
import { QuizAction } from '@/components/quiz/QuizAction';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TextInputQuestionProps {
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
}

export function TextInputQuestion({
  value,
  onChange,
  onContinue,
  placeholder,
  minLength = 5,
  maxLength = 200,
  multiline = false,
  autoFocus = true,
  isLoading = false,
  loadingText = 'Processando...',
}: TextInputQuestionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isValid = value.length >= minLength && value.length <= maxLength;
  const charCount = value.length;

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        if (multiline) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 300);
    }
  }, [autoFocus, multiline]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter' && isValid) {
      e.preventDefault();
      onContinue();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={cn(
              "w-full min-h-[160px] bg-muted/30 border-2 border-border/50 rounded-[32px] p-6 text-lg font-medium outline-none transition-all",
              "focus:border-primary focus:bg-background ring-0 placeholder:text-muted-foreground/50",
              "scrollbar-none"
            )}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={cn(
              "w-full h-16 bg-muted/30 border-2 border-border/50 rounded-[24px] px-6 text-lg font-bold outline-none transition-all",
              "focus:border-primary focus:bg-background ring-0 placeholder:text-muted-foreground/50"
            )}
            onKeyDown={handleKeyDown}
          />
        )}

        <div className="absolute bottom-4 right-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          {charCount}/{maxLength}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {charCount > 0 && charCount < minLength && (
          <p className="text-xs font-bold text-destructive text-center animate-in fade-in slide-in-from-top-1">
            Faltam {minLength - charCount} caracteres...
          </p>
        )}

        <QuizAction
          label={isLoading ? loadingText : 'Continuar'}
          onClick={onContinue}
          disabled={!isValid || isLoading}
          icon={isLoading ? Loader2 : undefined}
          className={cn(isLoading && "opacity-80")}
        />

        {!multiline && isValid && !isLoading && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-center">
            Pressione Enter para continuar
          </p>
        )}
      </div>
    </div>
  );
}
