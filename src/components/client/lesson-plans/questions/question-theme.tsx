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

  // Carregar temas dinâmicos da BNCC ao montar
  useEffect(() => {
    async function fetchThemes() {
      try {
        setLoadingThemes(true);

        const params = new URLSearchParams({
          educationLevelSlug,
        });

        if (gradeSlug) params.append('gradeSlug', gradeSlug);
        if (subjectSlug) params.append('subjectSlug', subjectSlug);

        const response = await fetch(`/api/v1/bncc/themes?${params}`);
        const data = await response.json();

        if (data.success && data.data.themes.length > 0) {
          setThemes(data.data.themes);
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
        // Mantém vazio em caso de erro
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

      if (!data.success) {
        throw new Error(data.error || 'Erro ao refinar tema');
      }

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
    }, 300);
  };

  // Etapa 1: Input do tema bruto
  if (step === 'input') {
    return (
      <QuizQuestion
        title="Qual o tema da aula?"
        description="Digite uma ideia simples, vamos refinar para você"
      >
        <div className="flex flex-col gap-4">
          {/* Instruções e exemplos dinâmicos */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Com base na sua seleção, sugerimos temas relacionados à BNCC:
            </p>

            {loadingThemes ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-4/6" />
              </div>
            ) : themes.length > 0 ? (
              <div className="space-y-2">
                {themes.map((theme, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setRawTheme(theme)}
                    className="flex items-start gap-2 text-left hover:text-primary transition-colors group w-full"
                  >
                    <span className="text-primary mt-0.5 opacity-50 group-hover:opacity-100">•</span>
                    <span className="text-sm font-medium">{theme}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma sugestão disponível. Digite livremente o tema da aula.
              </p>
            )}
          </div>

          <TextInputQuestion
            value={rawTheme}
            onChange={setRawTheme}
            onContinue={handleRefine}
            placeholder="Digite o tema da aula aqui..."
            minLength={3}
            maxLength={100}
            autoFocus
            isLoading={isRefining}
            loadingText="Refinando tema..."
          />
        </div>
      </QuizQuestion>
    );
  }

  // Etapa 2: Loading
  if (isRefining && refinedThemes.length === 0) {
    return (
      <QuizQuestion title="Refinando tema..." description="Criando versões profissionais">
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="relative">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Aguarde alguns segundos...</p>
        </div>
      </QuizQuestion>
    );
  }

  // Etapa 3: Seleção de tema refinado
  return (
    <QuizQuestion title="Escolha a melhor versão:" description={`Tema original: "${rawTheme}"`}>
      <div className="flex flex-col gap-3">
        {/* Temas refinados */}
        {refinedThemes.map((theme, index) => (
          <motion.button
            key={`${theme.version}-${regenerateCount}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTheme(theme.text)}
            className="flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-relaxed">{theme.text}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                Versão {theme.version === 'short' ? 'curta' : theme.version === 'medium' ? 'média' : 'descritiva'}
              </p>
            </div>
          </motion.button>
        ))}

        {/* Opção: usar tema original */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelectTheme(rawTheme)}
          className="flex items-start gap-4 p-4 rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary hover:bg-muted transition-all text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              Usar tema original: "{rawTheme}"
            </p>
          </div>
        </motion.button>

        {/* Botão regenerar */}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleRegenerate}
            disabled={isRefining}
            variant="outline"
            size="default"
            className="gap-2"
          >
            {isRefining ? (
              <>
                <Spinner className="h-4 w-4" />
                Gerando novos temas...
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4" />
                Gerar novos temas
              </>
            )}
          </Button>
        </div>
      </div>
    </QuizQuestion>
  );
}
