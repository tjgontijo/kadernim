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
export function QuestionGenerating({ onComplete }: QuestionGeneratingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Simular progress de 0 a 100% em ~14s
    const totalDuration = GENERATION_STEPS.reduce((acc, step) => acc + step.duration, 0);
    const interval = 100; // Update a cada 100ms
    const increment = (100 / totalDuration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);
        if (next >= 100) {
          clearInterval(timer);
          // Aguardar 500ms antes de chamar onComplete
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Atualizar step atual baseado no progresso
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
    <div className="flex flex-col items-center justify-center gap-8 py-12 px-6 max-w-md mx-auto">
      {/* Ícone animado */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        <div className="p-6 bg-primary/10 rounded-2xl">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <motion.div
          animate={{ scale: [0, 1.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-primary/20 rounded-2xl"
        />
      </motion.div>

      {/* Título */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Gerando seu plano</h3>
        <p className="text-sm text-muted-foreground">
          Aguarde enquanto criamos um plano personalizado para você
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-3">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-center font-medium text-muted-foreground">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Step atual */}
      <motion.div
        key={currentStepIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-3 text-sm"
      >
        <StepIcon className="h-5 w-5 text-primary shrink-0" />
        <span className="text-muted-foreground">{currentStep.text}</span>
      </motion.div>

      {/* Steps completados */}
      <div className="flex items-center justify-center gap-2">
        {GENERATION_STEPS.map((step, index) => (
          <div
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
