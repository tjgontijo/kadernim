import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getSystemPrompt, buildUserPrompt } from '@/lib/ai/prompts/lesson-plan';
import { LessonPlanContentSchema, type BnccSkillDetail, type LessonPlanContent } from '@/lib/schemas/lesson-plan';
import { logLlmUsage } from '@/services/llm/llm-usage-service';

/**
 * Parâmetros para geração de plano de aula
 */
export interface GenerateLessonPlanParams {
  userId: string;
  title: string;
  educationLevelSlug: string;
  gradeSlug?: string;
  subjectSlug?: string;
  numberOfClasses: number;
  bnccSkills: BnccSkillDetail[];
  intentRaw?: string;
}

/**
 * Resultado da validação pós-geração (Simplificada para MVP)
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida o conteúdo gerado (Simplificada para MVP)
 */
function validateGeneratedContent(
  content: LessonPlanContent,
  params: GenerateLessonPlanParams
): ValidationResult {
  const errors: string[] = [];
  const validCodes = params.bnccSkills.map(s => s.code);

  // 1. Validar que mainSkillCode está entre os válidos
  if (content.mainSkillCode && !validCodes.includes(content.mainSkillCode)) {
    console.warn(`[Validação] mainSkillCode "${content.mainSkillCode}" não está na lista original.`);
  }

  // 2. Validar que temos 3 etapas
  if (content.methodology?.length !== 3) {
    errors.push(`Plano gerado com ${content.methodology?.length} etapas (esperado: 3).`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gera o conteúdo de um plano de aula usando OpenAI
 */
export async function generateLessonPlanContent(
  params: GenerateLessonPlanParams
): Promise<LessonPlanContent> {
  const startTime = Date.now();
  const model = 'gpt-4o-mini';

  try {
    const systemPromptSelected = getSystemPrompt(params.educationLevelSlug);
    const userPrompt = buildUserPrompt({
      title: params.title,
      gradeSlug: params.gradeSlug,
      subjectSlug: params.subjectSlug,
      numberOfClasses: params.numberOfClasses,
      bnccSkills: params.bnccSkills,
      educationLevelSlug: params.educationLevelSlug,
      intentRaw: params.intentRaw,
    });

    // Gerar conteúdo estruturado com Strict Mode (Structured Outputs)
    const { object, usage } = await generateObject({
      model: openai(model),
      system: systemPromptSelected,
      prompt: userPrompt,
      schema: LessonPlanContentSchema,
      temperature: 0.7,
    });

    const validation = validateGeneratedContent(object, params);

    // Log de sucesso
    const promptTokens = (usage as any).promptTokens ?? (usage as any).prompt_tokens ?? 0;
    const completionTokens = (usage as any).completionTokens ?? (usage as any).completion_tokens ?? 0;

    await logLlmUsage({
      userId: params.userId,
      feature: 'lesson-plan-generation',
      operation: `Gerar plano MVP ${params.educationLevelSlug}`,
      model,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
      metadata: {
        educationLevel: params.educationLevelSlug,
        validationErrors: validation.errors,
      },
      rawUsage: usage
    } as any);

    return object;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await logLlmUsage({
      userId: params.userId,
      feature: 'lesson-plan-generation',
      operation: `Gerar plano MVP Error`,
      model,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs,
      status: 'error',
      errorMessage,
    });

    console.error('[generateLessonPlanContent] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('429')) throw new Error('Limite atingido. Tente em instantes.');
      if (error.message.includes('401')) throw new Error('Erro de configuração do serviço.');
      throw new Error(`Erro ao gerar plano: ${error.message}`);
    }

    throw new Error('Erro desconhecido ao gerar plano. Tente novamente.');
  }
}
