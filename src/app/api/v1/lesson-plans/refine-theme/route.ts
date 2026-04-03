import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RefineThemeRequestSchema } from '@/lib/lesson-plans/schemas';
import { auth } from '@/server/auth';
import { refineTheme } from '@/lib/lesson-plans/services/refine-theme';

/**
 * POST /api/v1/lesson-plans/refine-theme
 * 
 * Refina um tema bruto em 3 versões (curta, média, longa)
 */

export async function POST(request: Request) {
  try {
    // 1. Autenticação
    const session = await auth.api.getSession({ headers: request.headers });

    // 2. Validar body
    const body = await request.json();
    const validated = RefineThemeRequestSchema.parse(body);

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
