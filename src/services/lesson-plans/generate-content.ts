import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { systemPromptEI, systemPromptEF, buildUserPrompt } from '@/lib/ai/prompts/lesson-plan';
import { LessonPlanContentSchema, type BnccSkillDetail, type LessonPlanContent } from '@/lib/schemas/lesson-plan';
import { logLlmUsage } from '@/services/llm/llm-usage-service';

/**
 * Parâmetros para geração de plano de aula
 */
export interface GenerateLessonPlanParams {
  userId: string; // Obrigatório para logging
  title: string;
  educationLevelSlug: string;
  gradeSlug?: string;
  subjectSlug?: string;
  numberOfClasses: number;
  bnccSkills: BnccSkillDetail[];
}

/**
 * Gera o conteúdo de um plano de aula usando OpenAI
 *
 * Usa gpt-4o-mini para custo-benefício ótimo
 *
 * @param params - Parâmetros do plano
 * @returns Conteúdo estruturado e validado do plano
 * @throws Error se a geração falhar ou validação falhar
 */
export async function generateLessonPlanContent(
  params: GenerateLessonPlanParams
): Promise<LessonPlanContent> {
  const startTime = Date.now();
  const model = 'gpt-4o-mini';

  try {
    const isEI = params.educationLevelSlug === 'educacao-infantil';

    // Selecionar prompts específicos por nível
    const systemPromptSelected = isEI ? systemPromptEI : systemPromptEF;
    const userPrompt = buildUserPrompt(params);

    // Gerar conteúdo estruturado
    const { object, usage } = await generateObject({
      model: openai(model),
      system: systemPromptSelected,
      prompt: userPrompt,
      schema: LessonPlanContentSchema,
      temperature: 0.7,
    });

    // Log de sucesso
    const promptTokens = (usage as any).promptTokens ?? (usage as any).prompt_tokens ?? 0;
    const completionTokens = (usage as any).completionTokens ?? (usage as any).completion_tokens ?? 0;

    await logLlmUsage({
      userId: params.userId,
      feature: 'lesson-plan-generation',
      operation: `Gerar plano ${params.educationLevelSlug} - ${params.title}`,
      model,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
      metadata: {
        educationLevel: params.educationLevelSlug,
        grade: params.gradeSlug,
        subject: params.subjectSlug,
        numberOfClasses: params.numberOfClasses,
        skillsCount: params.bnccSkills.length,
      },
      // Passar objeto raw p/ debug no service se os tokens forem 0
      rawUsage: usage
    } as any);

    // O objeto já vem validado pelo Zod schema
    return object;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log de erro
    await logLlmUsage({
      userId: params.userId,
      feature: 'lesson-plan-generation',
      operation: `Gerar plano ${params.educationLevelSlug} - ${params.title}`,
      model,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs,
      status: 'error',
      errorMessage,
    });

    // Log detalhado do erro no console
    console.error('[generateLessonPlanContent] Error:', error);

    // Tratar erros específicos da OpenAI
    if (error instanceof Error) {
      // Rate limit
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('Limite de requisições atingido. Tente novamente em alguns segundos.');
      }

      // Token limit
      if (error.message.includes('token')) {
        throw new Error('Plano muito complexo. Tente com menos habilidades BNCC ou menor duração.');
      }

      // API key inválida
      if (error.message.includes('401') || error.message.includes('authentication')) {
        throw new Error('Erro de configuração do serviço. Contate o suporte.');
      }

      // Erro de validação (schema)
      if (error.message.includes('ZodError') || error.message.includes('validation')) {
        throw new Error('Erro ao processar plano gerado. Tente novamente.');
      }

      // Erro genérico
      throw new Error(`Erro ao gerar plano: ${error.message}`);
    }

    // Erro desconhecido
    throw new Error('Erro desconhecido ao gerar plano. Tente novamente.');
  }
}

/**
 * Estima o custo de geração de um plano
 *
 * Baseado em médias de tokens:
 * - Input: ~1.500 tokens (prompt + habilidades)
 * - Output: ~2.000 tokens (plano completo)
 * - Total: ~3.500 tokens
 *
 * gpt-4o-mini: $0.150/1M input + $0.600/1M output
 * Custo por plano: ~$0.0015 (menos de 1 centavo)
 */
export function estimateLessonPlanCost(numberOfSkills: number, numberOfClasses: number): number {
  const baseInputTokens = 1000;
  const tokensPerSkill = 200;
  const tokensPerClass = 100;
  const baseOutputTokens = 1500;
  const outputPerClass = 300;

  const estimatedInputTokens = baseInputTokens + numberOfSkills * tokensPerSkill + numberOfClasses * tokensPerClass;
  const estimatedOutputTokens = baseOutputTokens + numberOfClasses * outputPerClass;

  // gpt-4o-mini pricing (por 1M tokens)
  const INPUT_PRICE_PER_M = 0.15;
  const OUTPUT_PRICE_PER_M = 0.6;

  const inputCost = (estimatedInputTokens / 1_000_000) * INPUT_PRICE_PER_M;
  const outputCost = (estimatedOutputTokens / 1_000_000) * OUTPUT_PRICE_PER_M;

  return inputCost + outputCost;
}
