import { NextResponse } from 'next/server';
import { TaxonomyService } from '@/services/taxonomy/taxonomy.service';

/**
 * GET /api/v1/education-levels
 */
export async function GET() {
  try {
    const educationLevels = await TaxonomyService.listEducationLevels();

    return NextResponse.json({
      success: true,
      data: educationLevels,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar etapas de ensino',
      },
      { status: 500 }
    );
  }
}
