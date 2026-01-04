import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/grades
 *
 * Retorna lista de anos/faixas etárias (grades)
 * Query params:
 *   - educationLevelSlug?: string (opcional, filtra por etapa)
 *
 * Exemplos:
 *   - GET /api/v1/grades (todos os anos)
 *   - GET /api/v1/grades?educationLevelSlug=ensino-fundamental-1 (1º ao 5º ano)
 *   - GET /api/v1/grades?educationLevelSlug=educacao-infantil (faixas etárias EI)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const educationLevelSlug = searchParams.get('educationLevelSlug');

    const grades = await prisma.grade.findMany({
      where: educationLevelSlug
        ? {
          educationLevel: {
            slug: educationLevelSlug,
          },
        }
        : undefined,
      select: {
        id: true,
        slug: true,
        name: true,
        order: true,
        educationLevel: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Formatar resposta com educationLevelSlug plano
    const formattedGrades = grades.map((grade) => ({
      id: grade.id,
      slug: grade.slug,
      name: grade.name,
      order: grade.order,
      educationLevelSlug: grade.educationLevel.slug,
    }));

    return NextResponse.json({
      success: true,
      data: formattedGrades,
    });
  } catch (error) {
    console.error('[GET /api/v1/grades] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar anos/faixas etárias',
      },
      { status: 500 }
    );
  }
}
