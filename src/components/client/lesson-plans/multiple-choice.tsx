'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MultipleChoiceOption {
  value: string;
  label: string;
  description?: string;
}

interface MultipleChoiceProps {
  options: MultipleChoiceOption[];
  values: string[];
  onSelect: (values: string[]) => void;
  onContinue: () => void;
  min?: number;
  max?: number;
}

/**
 * MultipleChoice - Componente de seleção múltipla com validação
 *
 * Características:
 * - Checkboxes estilizados como cards
 * - Contador "X de Y selecionadas"
 * - Validação de mínimo/máximo
 * - Botão "Continuar" só ativo quando válido
 */
export function MultipleChoice({
  options,
  values,
  onSelect,
  onContinue,
  min = 1,
  max = 3,
}: MultipleChoiceProps) {
  const handleToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      // Remover
      onSelect(values.filter((v) => v !== optionValue));
    } else {
      // Adicionar (se não atingiu o máximo)
      if (values.length < max) {
        onSelect([...values, optionValue]);
      }
    }
  };

  const isValid = values.length >= min && values.length <= max;
  const selectedCount = values.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Contador */}
      <div className="text-center">
        <span className="text-sm font-medium">
          <span className={cn(selectedCount >= min ? 'text-primary' : 'text-muted-foreground')}>
            {selectedCount}
          </span>
          <span className="text-muted-foreground"> de {max} selecionadas</span>
        </span>
      </div>

      {/* Opções */}
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
        {options.map((option, index) => {
          const isSelected = values.includes(option.value);
          const canSelect = !isSelected && values.length < max;

          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleToggle(option.value)}
              disabled={!canSelect && !isSelected}
              className={cn(
                'relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left',
                'hover:border-primary/50 hover:bg-primary/5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              )}
            >
              {/* Checkbox customizado */}
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border-2 shrink-0 mt-0.5',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/50 bg-background'
                )}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>

              {/* Label e descrição */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {option.description}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Botão Continuar */}
      <Button
        onClick={onContinue}
        disabled={!isValid}
        size="lg"
        className="w-full mt-2"
      >
        Continuar
      </Button>

      {/* Mensagem de validação */}
      {!isValid && selectedCount > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          {selectedCount < min
            ? `Selecione pelo menos ${min} ${min === 1 ? 'habilidade' : 'habilidades'}`
            : `Máximo de ${max} habilidades permitidas`}
        </p>
      )}
    </div>
  );
}
