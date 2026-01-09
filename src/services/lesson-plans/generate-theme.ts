import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { themeSystemPrompt, buildThemeUserPrompt, type ThemePromptParams } from '@/lib/ai/prompts/theme';
import { logLlmUsage } from '@/services/llm/llm-usage-service';

export interface GenerateThemeParams extends ThemePromptParams {
    userId: string;
}

/**
 * Gera um tema/título para o plano de aula usando IA
 */
export async function generateTheme(params: GenerateThemeParams): Promise<string> {
    const startTime = Date.now();
    const model = 'gpt-4o-mini';

    try {
        const userPrompt = buildThemeUserPrompt(params);

        const { text, usage } = await generateText({
            model: openai(model),
            system: themeSystemPrompt,
            prompt: userPrompt,
            temperature: 0.7,
        });

        // Limpar o texto
        const theme = text
            .trim()
            .replace(/^["']|["']$/g, '') // Remove aspas
            .replace(/\.+$/, '') // Remove pontos finais
            .substring(0, 100); // Limite de segurança

        // Log de uso
        const promptTokens = (usage as any)?.promptTokens ?? 0;
        const completionTokens = (usage as any)?.completionTokens ?? 0;

        await logLlmUsage({
            userId: params.userId,
            feature: 'lesson-plan-theme',
            operation: 'Gerar tema do plano',
            model,
            inputTokens: promptTokens,
            outputTokens: completionTokens,
            latencyMs: Date.now() - startTime,
            status: 'success',
        });

        return theme;
    } catch (error) {
        await logLlmUsage({
            userId: params.userId,
            feature: 'lesson-plan-theme',
            operation: 'Gerar tema (erro)',
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
