import { NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomy/services';

/**
 * GET /api/v1/grades
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const educationLevelSlug = searchParams.get('educationLevelSlug') || undefined;

    const grades = await TaxonomyService.listGrades({ educationLevelSlug });

    return NextResponse.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar anos/faixas etárias',
      },
      { status: 500 }
    );
  }
}
