import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/subjects
 *
 * Retorna lista de disciplinas/campos de experiência (subjects)
 * Query params:
 *   - educationLevelSlug?: string (opcional, filtra por etapa)
 *   - gradeSlug?: string (opcional, filtra disciplinas válidas para o ano via GradeSubject)
 *
 * Exemplos:
 *   - GET /api/v1/subjects (todas as disciplinas)
 *   - GET /api/v1/subjects?educationLevelSlug=ensino-fundamental-1 (disciplinas do EF1)
 *   - GET /api/v1/subjects?educationLevelSlug=ensino-fundamental-1&gradeSlug=ef1-1-ano (disciplinas do 1º ano EF1)
 *   - GET /api/v1/subjects?educationLevelSlug=educacao-infantil (campos de experiência EI)
 *
 * Nota: Campos de Experiência da EI agora são Subjects normais vinculados via GradeSubject
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const educationLevelSlug = searchParams.get('educationLevelSlug');
    const gradeSlug = searchParams.get('gradeSlug');

    // Se gradeSlug foi informado, buscar via GradeSubject (disciplinas válidas para o ano)
    if (gradeSlug) {
      const gradeSubjects = await prisma.gradeSubject.findMany({
        where: {
          grade: {
            slug: gradeSlug,
          },
        },
        include: {
          subject: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
        orderBy: {
          subject: {
            name: 'asc',
          },
        },
      });

      const subjects = gradeSubjects.map((gs) => gs.subject);

      return NextResponse.json({
        success: true,
        data: subjects,
      });
    }

    // Caso contrário, buscar todas as disciplinas (com filtro opcional por etapa)
    if (educationLevelSlug) {
      // Buscar subjects válidos para a etapa (via Grades da etapa)
      const gradeSubjects = await prisma.gradeSubject.findMany({
        where: {
          grade: {
            educationLevel: {
              slug: educationLevelSlug,
            },
          },
        },
        include: {
          subject: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
        orderBy: {
          subject: {
            name: 'asc',
          },
        },
      });

      // Remover duplicatas (um subject pode estar em vários grades)
      const uniqueSubjects = Array.from(
        new Map(gradeSubjects.map((gs) => [gs.subject.slug, gs.subject])).values()
      );

      return NextResponse.json({
        success: true,
        data: uniqueSubjects,
      });
    }

    // Sem filtro: retorna todos os subjects
    const subjects = await prisma.subject.findMany({
      select: {
        slug: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error('[GET /api/v1/subjects] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar disciplinas',
      },
      { status: 500 }
    );
  }
}
