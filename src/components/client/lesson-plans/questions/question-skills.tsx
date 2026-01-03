'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion } from '../quiz-question';
import { MultipleChoice, type MultipleChoiceOption } from '../multiple-choice';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Sparkles, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BnccSkill {
  code: string;
  description: string;
  unitTheme?: string;
  knowledgeObject?: string;
  fieldOfExperience?: string;
}

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

/**
 * Question 6: Habilidades BNCC
 *
 * COM BUSCA HÍBRIDA:
 * - Se tema fornecido: mostra sugestões baseadas em FTS + embeddings
 * - Botão "Ver todos" para expandir lista completa
 * - Loading states informativos
 */
export function QuestionSkills({
  educationLevelSlug,
  gradeSlug,
  subjectSlug,
  theme,
  values,
  skillDetails,
  onSelect,
  onContinue,
}: QuestionSkillsProps) {
  const [suggestedSkills, setSuggestedSkills] = useState<BnccSkill[]>([]);
  const [allSkills, setAllSkills] = useState<BnccSkill[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar sugestões (com tema) ou todos (sem tema)
  useEffect(() => {
    async function fetchSuggestedSkills() {
      try {
        setLoadingSuggested(true);
        setError(null);

        const params = new URLSearchParams({
          educationLevelSlug,
          limit: theme ? '20' : '50', // 20 sugestões ou 50 total
        });

        if (gradeSlug) params.append('gradeSlug', gradeSlug);
        if (subjectSlug) params.append('subjectSlug', subjectSlug);

        // Se temos tema, fazer busca híbrida
        if (theme) {
          params.append('q', theme);
          params.append('searchMode', 'hybrid'); // FTS + embeddings
        }

        const response = await fetch(`/api/v1/bncc/skills?${params}`);

        if (!response.ok) {
          throw new Error('Erro ao carregar habilidades');
        }

        const data = await response.json();

        if (data.success) {
          setSuggestedSkills(data.data);

          // Se não temos tema, sugestões = todos
          if (!theme) {
            setAllSkills(data.data);
          }
        } else {
          throw new Error(data.error || 'Erro desconhecido');
        }
      } catch (err) {
        console.error('Error fetching suggested skills:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar habilidades');
      } finally {
        setLoadingSuggested(false);
      }
    }

    fetchSuggestedSkills();
  }, [educationLevelSlug, gradeSlug, subjectSlug, theme]);

  // Pre-carregar todos os códigos em background (se temos tema)
  useEffect(() => {
    if (!theme || allSkills.length > 0) return;

    async function fetchAllSkills() {
      try {
        setLoadingAll(true);

        const params = new URLSearchParams({
          educationLevelSlug,
          limit: '50',
        });

        if (gradeSlug) params.append('gradeSlug', gradeSlug);
        if (subjectSlug) params.append('subjectSlug', subjectSlug);
        // SEM tema - busca completa

        const response = await fetch(`/api/v1/bncc/skills?${params}`);
        const data = await response.json();

        if (data.success) {
          setAllSkills(data.data);
        }
      } catch (err) {
        console.error('Error pre-loading all skills:', err);
      } finally {
        setLoadingAll(false);
      }
    }

    // Delay de 500ms para não competir com busca de sugestões
    const timer = setTimeout(fetchAllSkills, 500);
    return () => clearTimeout(timer);
  }, [educationLevelSlug, gradeSlug, subjectSlug, theme, allSkills.length]);

  const handleSelectionChange = (selectedCodes: string[]) => {
    // Buscar nas skills atuais (sugeridas ou todas)
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

  // Loading state com mensagem contextual
  if (loadingSuggested) {
    return (
      <QuizQuestion
        title="Selecione até 3 habilidades BNCC"
        description={theme ? `Buscando habilidades sobre "${theme}"...` : 'Carregando habilidades disponíveis...'}
      >
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <Spinner className="h-8 w-8" />
            {theme && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-1 -right-1"
              >
                <Search className="h-4 w-4 text-primary" />
              </motion.div>
            )}
          </div>

          {theme && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-2"
            >
              <p className="text-sm font-medium text-primary">
                Analisando habilidades BNCC
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Estamos usando inteligência artificial para encontrar as habilidades mais relevantes para o tema escolhido
              </p>
            </motion.div>
          )}
        </div>
      </QuizQuestion>
    );
  }

  // Error state
  if (error) {
    return (
      <QuizQuestion
        title="Selecione até 3 habilidades BNCC"
        description="Ocorreu um erro ao carregar as habilidades"
      >
        <div className="text-center py-8">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </QuizQuestion>
    );
  }

  // Empty state - sugestões vazias mas há códigos disponíveis
  if (suggestedSkills.length === 0 && !loadingSuggested && allSkills.length > 0 && theme) {
    // Caso especial: busca não retornou resultados, mas temos códigos disponíveis
    // Automaticamente expande para mostrar todos
    if (!showAll) {
      setTimeout(() => setShowAll(true), 100);
    }
  }

  // Empty state completo - nenhuma habilidade disponível
  if (suggestedSkills.length === 0 && allSkills.length === 0 && !loadingSuggested && !loadingAll) {
    return (
      <QuizQuestion
        title="Selecione até 3 habilidades BNCC"
        description="Nenhuma habilidade encontrada"
      >
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Não encontramos habilidades BNCC para esta combinação.
            Tente voltar e ajustar suas seleções.
          </AlertDescription>
        </Alert>
      </QuizQuestion>
    );
  }

  // Determinar quais skills mostrar
  const displayedSkills = showAll ? allSkills : suggestedSkills;
  const hiddenCount = Math.max(0, allSkills.length - suggestedSkills.length);

  // Mapear skills para opções do MultipleChoice
  const options: MultipleChoiceOption[] = displayedSkills.map((skill) => ({
    value: skill.code,
    label: skill.code,
    description: truncateText(skill.description, 120),
  }));

  return (
    <QuizQuestion
      title="Selecione até 3 habilidades BNCC"
      description={
        showAll
          ? `${displayedSkills.length} habilidades disponíveis`
          : theme
          ? 'Sugestões baseadas no tema escolhido'
          : `${displayedSkills.length} habilidades disponíveis`
      }
    >
      <div className="flex flex-col gap-4">
        {/* Header de sugestões (se temos tema e não estamos mostrando todos) */}
        {!showAll && theme && suggestedSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-primary">
                  Sugestões inteligentes
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Selecionamos as {suggestedSkills.length} habilidades mais relevantes para{' '}
                  <span className="font-medium text-foreground">"{theme}"</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aviso quando busca não encontrou sugestões específicas */}
        {showAll && theme && suggestedSkills.length === 0 && allSkills.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Não encontramos sugestões específicas para "{theme}".
              Mostrando todas as {allSkills.length} habilidades disponíveis para você escolher.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de habilidades */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showAll ? 'all' : 'suggested'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MultipleChoice
              options={options}
              values={values}
              onSelect={handleSelectionChange}
              onContinue={onContinue}
              min={1}
              max={3}
            />
          </motion.div>
        </AnimatePresence>

        {/* Botão "Ver todos" / "Ver sugestões" - sempre disponível quando há tema */}
        {theme && suggestedSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!showAll ? (
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-all"
                onClick={() => setShowAll(true)}
                disabled={loadingAll}
              >
                <div className="flex items-center gap-2">
                  {loadingAll ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {loadingAll ? 'Carregando...' : 'Ver lista completa (ordem alfabética)'}
                  </span>
                </div>
                {!loadingAll && hiddenCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {hiddenCount} habilidade{hiddenCount !== 1 ? 's' : ''} a mais disponível{hiddenCount !== 1 ? 'is' : ''}
                  </span>
                )}
                {!loadingAll && hiddenCount === 0 && (
                  <span className="text-xs text-muted-foreground">
                    Mesmos {allSkills.length} código{allSkills.length !== 1 ? 's' : ''}, mas em ordem alfabética
                  </span>
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowAll(false)}
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Voltar para sugestões (ordem de relevância)
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </QuizQuestion>
  );
}

/**
 * Trunca texto longo para exibição
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
