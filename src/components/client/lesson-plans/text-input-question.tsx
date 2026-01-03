'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

interface TextInputQuestionProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
  autoFocus?: boolean;
  isLoading?: boolean; // Estado de processamento
  loadingText?: string; // Texto customizado durante loading
}

/**
 * TextInputQuestion - Input de texto com validação
 *
 * Características:
 * - Auto-focus no mount
 * - Validação de comprimento mínimo/máximo
 * - Botão "Continuar" só ativo quando válido
 * - Suporte para textarea (multiline)
 * - Contador de caracteres
 */
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

  // Auto-focus no mount
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        if (multiline) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 300); // Delay para aguardar animação
    }
  }, [autoFocus, multiline]);

  // Enter para continuar (só em input simples)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter' && isValid) {
      e.preventDefault();
      onContinue();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input ou Textarea */}
      {multiline ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="min-h-[120px] text-base resize-none"
          onKeyDown={handleKeyDown}
        />
      ) : (
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="h-12 text-base"
          onKeyDown={handleKeyDown}
        />
      )}

      {/* Contador de caracteres */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {charCount < minLength
            ? `Mínimo de ${minLength} caracteres`
            : `${charCount}/${maxLength} caracteres`}
        </span>
        {!multiline && isValid && (
          <span className="text-primary">Pressione Enter para continuar</span>
        )}
      </div>

      {/* Botão Continuar */}
      <Button
        onClick={onContinue}
        disabled={!isValid || isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Spinner className="h-4 w-4 mr-2" />
            {loadingText}
          </>
        ) : (
          'Continuar'
        )}
      </Button>
    </div>
  );
}
