import { NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomy/services';

/**
 * GET /api/v1/subjects
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const educationLevelSlug = searchParams.get('educationLevelSlug') || undefined;
    const gradeSlug = searchParams.get('gradeSlug') || undefined;


    const subjects = await TaxonomyService.listSubjects({
      educationLevelSlug,
      gradeSlug,
    });

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar disciplinas',
      },
      { status: 500 }
    );
  }
}
