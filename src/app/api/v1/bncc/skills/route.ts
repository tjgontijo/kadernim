import { NextResponse } from 'next/server';
import { BnccService } from '@/services/bncc/bncc-service';

/**
 * GET /api/v1/bncc/skills
 *
 * Busca habilidades BNCC com busca híbrida via BnccService
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const skills = await BnccService.searchSkills({
      q: searchParams.get('q'),
      searchMode: (searchParams.get('searchMode') || 'hybrid') as any,
      educationLevelSlug: searchParams.get('educationLevelSlug'),
      gradeSlugs: searchParams.getAll('gradeSlug'),
      subjectSlug: searchParams.get('subjectSlug'),
      limit: Math.min(Number(searchParams.get('limit')) || 50, 500),
    });

    return NextResponse.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error('[GET /api/v1/bncc/skills] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar habilidades BNCC',
      },
      { status: 500 }
    );
  }
}
