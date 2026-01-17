'use client';

import { useState } from 'react';
import { QuizChoice } from '@/components/client/quiz/QuizChoice';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Sparkles, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizStep } from '@/components/client/quiz/QuizStep';
import { useBnccSkills } from '@/hooks/entities/use-taxonomy';

interface QuestionSkillsProps {
  educationLevelSlug: string;
  gradeSlug?: string;
  subjectSlug?: string;
  theme?: string; // Tema selecionado (para busca híbrida)
  values: string[];
  skillDetails: Array<{ code: string; description: string }>;
  onSelect: (codes: string[], details: Array<{ code: string; description: string }>) => void;
  onContinue: () => void;
}

export function QuestionSkills({
  educationLevelSlug,
  gradeSlug,
  subjectSlug,
  theme,
  values,
  onSelect,
  onContinue,
}: QuestionSkillsProps) {
  const [showAll, setShowAll] = useState(false);

  // Busca sugestões (híbrido) baseadas no tema
  const {
    data: suggestedSkills = [],
    isLoading: loadingSuggested,
    error: suggestedError
  } = useBnccSkills({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    theme,
    limit: 20,
    searchMode: 'hybrid',
  });

  // Busca lista completa (texto)
  const {
    data: allSkills = [],
    isLoading: loadingAll,
    error: allError
  } = useBnccSkills({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    limit: 100,
    searchMode: 'text',
  });

  const error = suggestedError || allError;

  const handleSelectionChange = (selectedCodes: string[]) => {
    const currentSkills = showAll ? allSkills : suggestedSkills;

    const updatedDetails = selectedCodes.map((code) => {
      const skill = currentSkills.find((s) => s.code === code);
      return {
        code,
        description: skill?.description || '',
      };
    });

    onSelect(selectedCodes, updatedDetails);
  };

  if (loadingSuggested) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-10 py-12 px-6">
        <div className="relative">
          <Loader2 className="h-20 w-20 text-primary animate-spin" />
          {theme && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-2 -right-2 p-2 bg-primary rounded-full"
            >
              <Search className="h-5 w-5 text-primary-foreground" />
            </motion.div>
          )}
        </div>

        <div className="space-y-4 text-center">
          <h2 className="text-4xl font-black">Buscando BNCC...</h2>
          <p className="text-muted-foreground font-semibold max-w-sm mx-auto leading-relaxed">
            {theme
              ? `Analisando habilidades relevantes para "${theme}"`
              : 'Preparando lista de habilidades disponíveis'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <QuizStep
        title="Ops! Algo deu errado"
        description={error instanceof Error ? error.message : 'Erro ao carregar habilidades'}
      >
        <div className="text-center py-8">
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </QuizStep>
    );
  }

  if (suggestedSkills.length === 0 && !loadingSuggested && allSkills.length > 0 && theme) {
    if (!showAll) {
      setTimeout(() => setShowAll(true), 100);
    }
  }

  if (suggestedSkills.length === 0 && allSkills.length === 0 && !loadingSuggested && !loadingAll) {
    return (
      <QuizStep
        title="Nenhuma habilidade"
        description="Não encontramos habilidades BNCC para este filtro."
      >
        <Alert className="rounded-2xl border-2">
          <Info className="h-5 w-5" />
          <AlertDescription className="font-medium">
            Tente retornar e ajustar a série ou disciplina selecionada.
          </AlertDescription>
        </Alert>
      </QuizStep>
    );
  }

  const displayedSkills = showAll ? allSkills : suggestedSkills;

  return (
    <QuizStep
      title="Quais habilidades?"
      description={
        showAll
          ? `${displayedSkills.length} habilidades em ordem alfabética`
          : theme
            ? 'Sugestões baseadas no seu tema'
            : `${displayedSkills.length} habilidades disponíveis`
      }
    >
      <div className="flex flex-col gap-6">
        {!showAll && theme && suggestedSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-primary/5 border-2 border-primary/10 rounded-[28px] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3">
              <Sparkles className="h-5 w-5 text-primary/30 group-hover:text-primary transition-colors" />
            </div>
            <div className="flex items-start gap-4 pr-8">
              <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-primary leading-snug">
                Filtramos as {suggestedSkills.length} habilidades que mais combinam com o seu tema.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={showAll ? 'all' : 'suggested'}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <QuizChoice
              options={displayedSkills.map(skill => ({
                id: skill.code,
                slug: skill.code,
                name: skill.code,
                description: skill.description
              }))}
              value={values}
              onSelect={(opt) => {
                const selected = values.includes(opt.slug);
                const newValues = selected
                  ? values.filter(v => v !== opt.slug)
                  : [...values, opt.slug];
                handleSelectionChange(newValues);
              }}
              multiple={true}
              minSelection={1}
              maxSelection={3}
              showCounter={true}
              onContinue={onContinue}
              continueLabel="Revisar Aula"
            />
          </motion.div>
        </AnimatePresence>

        {theme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {!showAll ? (
              <Button
                variant="ghost"
                className="w-full h-14 rounded-2xl font-black gap-2 uppercase tracking-widest text-[10px] text-muted-foreground/60 hover:text-primary"
                onClick={() => setShowAll(true)}
                disabled={loadingAll}
              >
                {loadingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {loadingAll ? 'Carregando lista completa...' : `Ver todos (${allSkills.length})`}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full h-12 rounded-xl font-bold gap-2 text-primary"
                onClick={() => setShowAll(false)}
              >
                <ChevronUp className="h-4 w-4" />
                Voltar para sugestões
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </QuizStep>
  );
}

/**
 * Trunca texto longo para exibição
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
