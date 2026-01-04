import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import {
    systemPromptRefineDescription,
    buildRefineDescriptionPrompt,
    systemPromptGenerateTitle,
    buildGenerateTitlePrompt,
} from '@/lib/ai/prompts/community-request';

/**
 * Schema para as 3 versões refinadas
 */
const RefinedDescriptionsSchema = z.object({
    format: z.string().describe('Versão focada no formato e tipo de material'),
    usability: z.string().describe('Versão focada na aplicação prática em sala'),
    pedagogy: z.string().describe('Versão focada nos objetivos pedagógicos'),
});

export interface RefineDescriptionParams {
    rawDescription: string;
    educationLevelName: string;
    subjectName: string;
    gradeNames: string[];
}

export interface RefinedDescription {
    type: 'format' | 'usability' | 'pedagogy';
    label: string;
    text: string;
}

/**
 * Refina uma descrição de pedido em 3 versões estruturadas
 */
export async function refineRequestDescription(
    params: RefineDescriptionParams
): Promise<RefinedDescription[]> {
    try {
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            system: systemPromptRefineDescription,
            prompt: buildRefineDescriptionPrompt(params),
            schema: RefinedDescriptionsSchema,
            temperature: 0.7,
        });

        return [
            { type: 'format', label: 'Formato & Design', text: object.format },
            { type: 'usability', label: 'Aplicação em Aula', text: object.usability },
            { type: 'pedagogy', label: 'Objetivo Pedagógico', text: object.pedagogy },
        ];
    } catch (error) {
        console.error('[refineRequestDescription] Error:', error);

        if (error instanceof Error) {
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                throw new Error('Limite de requisições atingido. Tente novamente em alguns segundos.');
            }
        }

        throw new Error('Erro ao refinar descrição. Tente novamente.');
    }
}

/**
 * Gera um título curto para o pedido baseado na descrição
 */
export async function generateRequestTitle(description: string): Promise<string> {
    try {
        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            system: systemPromptGenerateTitle,
            prompt: buildGenerateTitlePrompt(description),
            temperature: 0.6,
        });

        // Limpar aspas e espaços extras
        return text.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
        console.error('[generateRequestTitle] Error:', error);
        throw new Error('Erro ao gerar título. Tente novamente.');
    }
}
