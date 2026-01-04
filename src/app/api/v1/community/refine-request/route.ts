import { NextResponse } from 'next/server';
import { z } from 'zod';
import { refineRequestDescription } from '@/services/community/refine-description';

/**
 * POST /api/v1/community/refine-request
 *
 * Refina uma descrição de pedido em 3 versões estruturadas usando IA
 *
 * Request body:
 * {
 *   rawDescription: string,
 *   educationLevelName: string,
 *   subjectName: string,
 *   gradeNames: string[]
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     refined: [
 *       { type: 'format', label: string, text: string },
 *       { type: 'usability', label: string, text: string },
 *       { type: 'pedagogy', label: string, text: string }
 *     ]
 *   }
 * }
 */

const RequestSchema = z.object({
    rawDescription: z.string().min(20, 'Descrição muito curta'),
    educationLevelName: z.string(),
    subjectName: z.string(),
    gradeNames: z.array(z.string()),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = RequestSchema.parse(body);

        const refined = await refineRequestDescription(validated);

        return NextResponse.json({
            success: true,
            data: { refined },
        });
    } catch (error) {
        console.error('[POST /api/v1/community/refine-request] Error:', error);

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
            { success: false, error: 'Erro ao processar com IA' },
            { status: 500 }
        );
    }
}
