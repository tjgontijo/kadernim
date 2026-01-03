import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/education-levels
 *
 * Retorna lista de etapas de ensino (education levels)
 * Reutilizável em todo o sistema (recursos, wizard BNCC, admin, etc)
 */
export async function GET() {
  try {
    const educationLevels = await prisma.educationLevel.findMany({
      select: {
        slug: true,
        name: true,
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: educationLevels,
    });
  } catch (error) {
    console.error('[GET /api/v1/education-levels] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar etapas de ensino',
      },
      { status: 500 }
    );
  }
}
