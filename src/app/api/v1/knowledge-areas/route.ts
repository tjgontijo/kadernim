import { NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomy/services';

/**
 * GET /api/v1/knowledge-areas
 */
export async function GET() {
  try {
    const knowledgeAreas = await TaxonomyService.listKnowledgeAreas();

    return NextResponse.json({
      success: true,
      data: knowledgeAreas,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar áreas de conhecimento',
      },
      { status: 500 }
    );
  }
}
