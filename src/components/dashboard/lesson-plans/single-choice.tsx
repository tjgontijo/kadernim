'use client';

import { motion } from 'framer-motion';
import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/index';

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface SingleChoiceProps {
  options: ChoiceOption[];
  value?: string;
  onSelect: (value: string) => void;
  autoAdvanceDelay?: number; // Delay antes de avançar automaticamente (ms)
}

/**
 * SingleChoice - Componente de seleção única com auto-avanço
 *
 * Características:
 * - Cards grandes e clicáveis
 * - Auto-avança após seleção (com delay configurável)
 * - Animação de feedback visual (scale + check)
 * - Mobile-friendly
 */
export function SingleChoice({
  options,
  value,
  onSelect,
  autoAdvanceDelay = 600,
}: SingleChoiceProps) {
  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option.value)}
            className={cn(
              'relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              'hover:border-primary/50 hover:bg-primary/5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            )}
          >
            {/* Ícone (se fornecido) */}
            {Icon && (
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg shrink-0',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
            )}

            {/* Label e descrição */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base">{option.label}</div>
              {option.description && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              )}
            </div>

            {/* Indicador de seleção */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shrink-0"
              >
                <Check className="h-4 w-4 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
