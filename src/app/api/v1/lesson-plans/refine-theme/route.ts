import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { refineTheme } from '@/services/lesson-plans/refine-theme';

/**
 * POST /api/v1/lesson-plans/refine-theme
 * 
 * Refina um tema bruto em 3 versões (curta, média, longa)
 */

const RequestSchema = z.object({
  rawTheme: z.string().min(3, 'Tema muito curto'),
  educationLevelSlug: z.string(),
  gradeSlug: z.string(),
  subjectSlug: z.string(),
  seed: z.number().optional().default(0),
});

export async function POST(request: Request) {
  try {
    // 1. Autenticação
    const session = await auth.api.getSession({ headers: request.headers });

    // 2. Validar body
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    // 3. Refinar tema via service
    const result = await refineTheme({
      userId: session?.user?.id,
      rawTheme: validated.rawTheme,
      educationLevelSlug: validated.educationLevelSlug,
      gradeSlug: validated.gradeSlug,
      subjectSlug: validated.subjectSlug,
      seed: validated.seed,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[POST /api/v1/lesson-plans/refine-theme] Error:', error);

    // Erros de validação
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    // Erros da OpenAI
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Limite de requisições. Aguarde alguns segundos.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao refinar tema. Tente novamente.' },
      { status: 500 }
    );
  }
}
