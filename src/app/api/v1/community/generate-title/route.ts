import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRequestTitle } from '@/services/community/refine-description';

/**
 * POST /api/v1/community/generate-title
 *
 * Gera um título curto para o pedido baseado na descrição
 *
 * Request body:
 * {
 *   description: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: { title: string }
 * }
 */

const RequestSchema = z.object({
    description: z.string().min(20, 'Descrição muito curta'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description } = RequestSchema.parse(body);

        const title = await generateRequestTitle(description);

        return NextResponse.json({
            success: true,
            data: { title },
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
