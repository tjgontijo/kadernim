import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getRefineSystemPrompt, buildRefineUserPrompt, type RefineThemeParams } from '@/lib/ai/prompts/theme';
import { logLlmUsage } from '@/services/llm/llm-usage-service';

const RefinedThemesSchema = z.object({
    short: z.string().describe('Versão curta e objetiva do tema (máximo 6 palavras)'),
    medium: z.string().describe('Versão média do tema com contexto pedagógico (máximo 15 palavras)'),
    long: z.string().describe('Versão descritiva e completa do tema alinhada com BNCC (máximo 25 palavras)'),
});

export interface RefineThemeServiceParams extends RefineThemeParams {
    userId?: string;
    seed?: number;
}

export interface RefinedTheme {
    version: 'short' | 'medium' | 'long';
    text: string;
}

export interface RefineThemeResult {
    original: string;
    refined: RefinedTheme[];
}

/**
 * Refina um tema bruto em 3 versões (curta, média, longa)
 */
export async function refineTheme(params: RefineThemeServiceParams): Promise<RefineThemeResult> {
    const startTime = Date.now();
    const model = 'gpt-4o-mini';
    const { userId, seed = 0, ...promptParams } = params;

    try {
        const isEI = params.educationLevelSlug === 'educacao-infantil';
        const systemPrompt = getRefineSystemPrompt(isEI);
        const userPrompt = buildRefineUserPrompt(promptParams);

        const { object, usage } = await generateObject({
            model: openai(model),
            system: systemPrompt,
            prompt: userPrompt,
            schema: RefinedThemesSchema,
            temperature: 0.8 + seed * 0.1,
        });

        // Log de sucesso
        const promptTokens = (usage as any)?.promptTokens ?? 0;
        const completionTokens = (usage as any)?.completionTokens ?? 0;

        await logLlmUsage({
            userId,
            feature: 'theme-refinement',
            operation: `Refinar tema: "${params.rawTheme}"`,
            model,
            inputTokens: promptTokens,
            outputTokens: completionTokens,
            latencyMs: Date.now() - startTime,
            status: 'success',
            metadata: {
                rawTheme: params.rawTheme,
                educationLevel: params.educationLevelSlug,
                seed,
            },
            rawUsage: usage,
        } as any);

        return {
            original: params.rawTheme,
            refined: [
                { version: 'short', text: object.short },
                { version: 'medium', text: object.medium },
                { version: 'long', text: object.long },
            ],
        };
    } catch (error) {
        await logLlmUsage({
            userId,
            feature: 'theme-refinement',
            operation: 'Refinar tema (erro)',
            model,
            inputTokens: 0,
            outputTokens: 0,
            latencyMs: Date.now() - startTime,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
    }
}
