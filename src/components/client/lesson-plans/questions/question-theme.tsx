'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RotateCw, FileText } from 'lucide-react';
import { QuizQuestion } from '../quiz-question';
import { TextInputQuestion } from '../text-input-question';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

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

/**
 * Question 4: Tema da Aula
 *
 * Fluxo em 2 etapas:
 * 1. Professora escreve tema bruto (com sugestões baseadas na BNCC)
 * 2. IA refina em 3 versões profissionais + opção de regenerar
 *
 * Features:
 * - Sugestões dinâmicas de temas da BNCC (baseadas em educationLevel/grade/subject)
 * - Skeleton loading durante fetch de temas
 * - Click para preencher automaticamente
 */
import { QuizStep } from '@/components/quiz/QuizStep';
import { QuizCard } from '@/components/quiz/QuizCard';

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
  const [isRefining, setIsRefining] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [themes, setThemes] = useState<string[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);

  useEffect(() => {
    async function fetchThemes() {
      try {
        setLoadingThemes(true);
        const params = new URLSearchParams({ educationLevelSlug });
        if (gradeSlug) params.append('gradeSlug', gradeSlug);
        if (subjectSlug) params.append('subjectSlug', subjectSlug);
        const response = await fetch(`/api/v1/bncc/themes?${params}`);
        const data = await response.json();
        if (data.success && data.data.themes.length > 0) {
          setThemes(data.data.themes);
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
      } finally {
        setLoadingThemes(false);
      }
    }
    fetchThemes();
  }, [educationLevelSlug, gradeSlug, subjectSlug]);

  const handleRefine = async () => {
    if (rawTheme.length < 3) {
      toast.error('Digite pelo menos 3 caracteres');
      return;
    }
    setIsRefining(true);
    try {
      const response = await fetch('/api/v1/lesson-plans/refine-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawTheme,
          educationLevelSlug,
          gradeSlug,
          subjectSlug,
          seed: regenerateCount,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erro ao refinar tema');
      setRefinedThemes(data.data.refined);
      setStep('selection');
    } catch (error) {
      console.error('Error refining theme:', error);
      toast.error('Erro ao refinar tema', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleRegenerate = () => {
    setRegenerateCount((prev) => prev + 1);
    handleRefine();
  };

  const handleSelectTheme = (theme: string) => {
    onChange(theme);
    setTimeout(() => {
      onContinue();
    }, 400);
  };

  if (step === 'input') {
    return (
      <QuizStep
        title="Qual o tema da aula?"
        description="Digite uma ideia simples, vamos refinar para você."
      >
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-primary/5 rounded-[32px] border-2 border-primary/10">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
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
              <div className="flex flex-wrap gap-2">
                {themes.map((theme, index) => (
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

          <TextInputQuestion
            value={rawTheme}
            onChange={setRawTheme}
            onContinue={handleRefine}
            placeholder="Digite o tema aqui..."
            minLength={3}
            maxLength={100}
            autoFocus
            isLoading={isRefining}
            loadingText="Refinando com IA..."
          />
        </div>
      </QuizStep>
    );
  }

  if (isRefining && refinedThemes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <RotateCw className="h-16 w-16 text-primary animate-spin" />
        <h2 className="text-2xl font-black">Refinando seu tema...</h2>
      </div>
    );
  }

  return (
    <QuizStep
      title="Escolha a melhor versão"
      description={`Refinamos sua ideia: "${rawTheme}"`}
    >
      <div className="grid grid-cols-1 gap-4">
        {refinedThemes.map((theme, index) => (
          <QuizCard
            key={`${theme.version}-${regenerateCount}-${index}`}
            title={theme.text}
            description={`Versão ${theme.version === 'short' ? 'curta' : theme.version === 'medium' ? 'média' : 'descritiva'}`}
            icon={FileText}
            selected={value === theme.text}
            onClick={() => handleSelectTheme(theme.text)}
          />
        ))}

        <button
          onClick={() => handleSelectTheme(rawTheme)}
          className="p-6 rounded-[24px] border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-left group"
        >
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 mb-1 group-hover:text-primary/50 transition-colors">
            Manter original
          </p>
          <p className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">
            {rawTheme}
          </p>
        </button>

        <div className="pt-4">
          <Button
            onClick={handleRegenerate}
            disabled={isRefining}
            variant="ghost"
            className="w-full h-12 rounded-xl font-bold gap-2"
          >
            {isRefining ? (
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
