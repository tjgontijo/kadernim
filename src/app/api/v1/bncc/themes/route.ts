import { NextRequest, NextResponse } from 'next/server';
import { BnccThemeSuggestionsQuerySchema } from '@/schemas/bncc/bncc-schemas';
import { BnccService } from '@/services/bncc/bncc-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = BnccThemeSuggestionsQuerySchema.safeParse({
      educationLevelSlug: searchParams.get('educationLevelSlug'),
      gradeSlug: searchParams.get('gradeSlug') ?? undefined,
      subjectSlug: searchParams.get('subjectSlug') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const themes = await BnccService.getThemeSuggestions(parsed.data);

    return NextResponse.json({
      success: true,
      data: { themes },
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Education level not found') {
      return NextResponse.json({ success: false, error: 'Etapa não encontrada' }, { status: 404 });
    }

    console.error('[GET /api/v1/bncc/themes] Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar temas' }, { status: 500 });
  }
}
