'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Target, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GENERATION_STEPS = [
  { icon: BookOpen, text: 'Analisando habilidades BNCC...', duration: 3000 },
  { icon: Target, text: 'Criando objetivos de aprendizagem...', duration: 4000 },
  { icon: Lightbulb, text: 'Planejando metodologia...', duration: 4000 },
  { icon: CheckCircle2, text: 'Estruturando avaliação...', duration: 3000 },
];

interface QuestionGeneratingProps {
  onComplete?: () => void;
}

/**
 * Question: Gerando Plano
 *
 * Loading state com progress fake e textos motivacionais
 */
import { Loader2 } from 'lucide-react';

export function QuestionGenerating({ onComplete }: QuestionGeneratingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const totalDuration = GENERATION_STEPS.reduce((acc, step) => acc + step.duration, 0);
    const interval = 100;
    const increment = (100 / totalDuration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepThreshold = 100 / GENERATION_STEPS.length;
    const newIndex = Math.min(
      Math.floor(progress / stepThreshold),
      GENERATION_STEPS.length - 1
    );
    setCurrentStepIndex(newIndex);
  }, [progress]);

  const currentStep = GENERATION_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-12 py-12 px-6 max-w-md mx-auto h-full">
      {/* Ícone animado centralizado */}
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="p-10 bg-primary/5 rounded-[40px] relative z-10"
        >
          <Sparkles className="h-20 w-20 text-primary" />
        </motion.div>
        <motion.div
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-x-0 -bottom-4 h-24 bg-primary blur-3xl rounded-full"
        />
      </div>

      {/* Título e status */}
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-black">Criando sua aula...</h2>
        <motion.p
          key={currentStepIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground font-semibold h-6"
        >
          {currentStep.text}
        </motion.p>
      </div>

      {/* Progress system */}
      <div className="w-full space-y-6">
        <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden border-2 border-border/20">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>

        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progresso</span>
          <span className="text-sm font-black text-primary">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Passos visuais */}
      <div className="flex items-center justify-center gap-3">
        {GENERATION_STEPS.map((step, index) => (
          <div
            key={index}
            className={`h-2 w-8 rounded-full transition-all duration-500 ${index <= currentStepIndex
                ? 'bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]'
                : index === currentStepIndex + 1
                  ? 'bg-muted animate-pulse'
                  : 'bg-muted/30'
              }`}
          />
        ))}
      </div>
    </div>
  );
}
