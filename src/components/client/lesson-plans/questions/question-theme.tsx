'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RotateCw, FileText } from 'lucide-react';
import { QuizTextInput } from '@/components/client/quiz/QuizTextInput';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizChoice, type QuizOption } from '@/components/client/quiz/QuizChoice';
import { useBnccThemes } from '@/hooks/entities/use-taxonomy';
import { useMutation } from '@tanstack/react-query';

interface RefinedTheme {
  version: 'short' | 'medium' | 'long';
  text: string;
}

interface QuestionThemeProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  educationLevelSlug: string;
  gradeSlug: string;
  subjectSlug: string;
}

type Step = 'input' | 'selection';

export function QuestionTheme({
  value,
  onChange,
  onContinue,
  educationLevelSlug,
  gradeSlug,
  subjectSlug,
}: QuestionThemeProps) {
  const [step, setStep] = useState<Step>('input');
  const [rawTheme, setRawTheme] = useState('');
  const [refinedThemes, setRefinedThemes] = useState<RefinedTheme[]>([]);
  const [regenerateCount, setRegenerateCount] = useState(0);

  // Busca temas sugeridos via React Query
  const { data: themes = [], isLoading: loadingThemes } = useBnccThemes({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
  });

  // Mutação para refinar o tema com IA
  const refineMutation = useMutation({
    mutationFn: async (currentRawTheme: string) => {
      const response = await fetch('/api/v1/lesson-plans/refine-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawTheme: currentRawTheme,
          educationLevelSlug,
          gradeSlug,
          subjectSlug,
          seed: regenerateCount,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erro ao refinar tema');
      return data.data.refined as RefinedTheme[];
    },
    onSuccess: (data) => {
      setRefinedThemes(data);
      setStep('selection');
    },
    onError: (error) => {
      console.error('Error refining theme:', error);
      toast.error('Erro ao refinar tema', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    },
  });

  const handleRefine = () => {
    if (rawTheme.length < 3) {
      toast.error('Digite pelo menos 3 caracteres');
      return;
    }
    refineMutation.mutate(rawTheme);
  };

  const handleRegenerate = () => {
    setRegenerateCount((prev) => prev + 1);
    refineMutation.mutate(rawTheme);
  };

  const handleSelectTheme = (theme: string) => {
    onChange(theme);
    onContinue();
  };

  if (step === 'input') {
    return (
      <QuizStep
        title="Qual o tema da aula?"
        description="Escolha ou digite uma ideia simples, vamos usar nossa Inteligência Artificial para refinar o tema."
      >
        <div className="flex flex-col gap-8">
          <div className="p-6 bg-primary/5 rounded-[32px] border-2 border-primary/10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 fill-current" />
              Sugestões BNCC
            </p>

            {loadingThemes ? (
              <div className="space-y-3">
                <div className="h-4 bg-primary/10 rounded-full animate-pulse w-full" />
                <div className="h-4 bg-primary/10 rounded-full animate-pulse w-5/6" />
                <div className="h-4 bg-primary/10 rounded-full animate-pulse w-4/6" />
              </div>
            ) : themes.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-start">
                {themes.slice(0, 5).map((theme, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setRawTheme(theme)}
                    className="px-4 py-2 rounded-full bg-background border border-border/50 text-sm font-semibold hover:border-primary hover:text-primary transition-all"
                  >
                    {theme}
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma sugestão disponível. Digite livremente.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground ml-2">
              Ou digite aqui o tema do plano de aula:
            </p>
            <QuizTextInput
              value={rawTheme}
              onChange={setRawTheme}
              onContinue={handleRefine}
              placeholder="Descreva o que deseja trabalhar nesta aula..."
              minLength={3}
              maxLength={200}
              multiline={true}
              autoFocus
              isLoading={refineMutation.isPending}
              loadingText="Refinando com IA..."
            />
          </div>
        </div>
      </QuizStep>
    );
  }

  if (refineMutation.isPending && refinedThemes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <RotateCw className="h-16 w-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold">Refinando seu tema...</h2>
      </div>
    );
  }

  const refinedOptions: QuizOption[] = [
    ...refinedThemes.map((theme) => ({
      id: theme.version,
      slug: theme.text,
      name: theme.text,
      description: `Versão ${theme.version === 'short' ? 'curta' : theme.version === 'medium' ? 'média' : 'descritiva'}`,
      icon: FileText,
    })),
    {
      id: 'original',
      slug: rawTheme,
      name: rawTheme,
      description: 'Manter texto original',
      icon: Sparkles,
    },
  ];

  return (
    <QuizStep
      title="Escolha a melhor versão"
      description={`Refinamos sua ideia: "${rawTheme}"`}
    >
      <div className="space-y-6">
        <QuizChoice
          options={refinedOptions}
          value={value}
          onSelect={(opt) => handleSelectTheme(opt.slug)}
          autoAdvance={true}
        />

        <div className="pt-2">
          <Button
            onClick={handleRegenerate}
            disabled={refineMutation.isPending}
            variant="ghost"
            className="w-full h-12 rounded-xl font-bold gap-2 uppercase tracking-widest text-[10px]"
          >
            {refineMutation.isPending ? (
              <RotateCw className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCw className="h-4 w-4" />
            )}
            Gerar novas opções
          </Button>
        </div>
      </div>
    </QuizStep>
  );
}
