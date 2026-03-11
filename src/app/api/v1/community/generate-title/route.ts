import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import {
    CommunityGeneratedTitlesSchema,
    GenerateCommunityTitleRequestSchema,
} from '@/schemas/community/community-schemas';
import {
    systemPromptGenerateTitle,
    buildGenerateTitlePrompt,
} from '@/lib/ai/prompts/community-request';

/**
 * POST /api/v1/community/generate-title
 *
 * Gera 3 opções de título para o pedido baseado na descrição
 *
 * Request body:
 * {
 *   description: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     titles: [
 *       { type: 'short', text: string },
 *       { type: 'descriptive', text: string },
 *       { type: 'creative', text: string }
 *     ]
 *   }
 * }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description } = GenerateCommunityTitleRequestSchema.parse(body);

        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            system: systemPromptGenerateTitle,
            prompt: buildGenerateTitlePrompt(description),
            schema: CommunityGeneratedTitlesSchema,
            temperature: 0.8,
        });

        return NextResponse.json({
            success: true,
            data: {
                titles: [
                    { type: 'short', label: 'Curto', text: object.short },
                    { type: 'descriptive', label: 'Descritivo', text: object.descriptive },
                    { type: 'creative', label: 'Criativo', text: object.creative },
                ]
            },
        });
    } catch (error) {
        console.error('[POST /api/v1/community/generate-title] Error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Erro ao gerar título' },
            { status: 500 }
        );
    }
}
