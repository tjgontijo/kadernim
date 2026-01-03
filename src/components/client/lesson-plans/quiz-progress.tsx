'use client';

import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
}

/**
 * QuizProgress - Indicador de progresso do wizard
 *
 * Exibe "X de Y" com barra de progresso animada
 */
export function QuizProgress({ current, total }: QuizProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="flex flex-col items-center gap-2 min-w-[100px]">
      {/* Texto "X de Y" */}
      <span className="text-sm font-medium text-muted-foreground">
        {current} de {total}
      </span>

      {/* Barra de progresso */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
