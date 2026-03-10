import { NextResponse } from 'next/server';
import { TaxonomyService } from '@/services/taxonomy/taxonomy.service';

/**
 * GET /api/v1/subjects
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const educationLevelSlug = searchParams.get('educationLevelSlug') || undefined;
    const gradeSlug = searchParams.get('gradeSlug') || undefined;
    const bnccOnly = searchParams.get('bnccOnly') === 'true';

    const subjects = await TaxonomyService.listSubjects({
      educationLevelSlug,
      gradeSlug,
      bnccOnly
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
