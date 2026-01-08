import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/bncc/themes
 *
 * Retorna temas principais (knowledgeObject) de habilidades BNCC
 * para gerar placeholders dinâmicos no wizard
 *
 * Query params:
 * - educationLevelSlug (required)
 * - gradeSlug (optional)
 * - subjectSlug (optional)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     themes: ["Fração", "Sistema de numeração decimal", "Geometria"]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const educationLevelSlug = searchParams.get('educationLevelSlug');
    const gradeSlug = searchParams.get('gradeSlug');
    const subjectSlug = searchParams.get('subjectSlug');

    if (!educationLevelSlug) {
      return NextResponse.json(
        {
          success: false,
          error: 'educationLevelSlug é obrigatório',
        },
        { status: 400 }
      );
    }

    // Buscar IDs a partir dos slugs
    const educationLevel = await prisma.educationLevel.findUnique({
      where: { slug: educationLevelSlug }
    });

    if (!educationLevel) {
      return NextResponse.json(
        { success: false, error: 'Etapa não encontrada' },
        { status: 404 }
      );
    }

    let gradeId: string | undefined;
    if (gradeSlug) {
      const grade = await prisma.grade.findUnique({
        where: { slug: gradeSlug }
      });
      gradeId = grade?.id;
    }

    let subjectId: string | undefined;
    if (subjectSlug) {
      const subject = await prisma.subject.findUnique({
        where: { slug: subjectSlug }
      });
      subjectId = subject?.id;
    }

    // Buscar temas únicos (knowledgeObject)
    const isEI = educationLevelSlug === 'educacao-infantil';
    let themes: string[] = [];

    if (isEI) {
      // Educação Infantil: tentar knowledgeObject primeiro
      const skillsWithKnowledgeObject = await prisma.bnccSkill.findMany({
        where: {
          educationLevelId: educationLevel.id,
          ...(gradeId && { gradeId }),
          ...(subjectId && { subjectId }),
          knowledgeObject: { not: null },
        },
        select: { knowledgeObject: true },
        distinct: ['knowledgeObject'],
        take: 5,
      });

      if (skillsWithKnowledgeObject.length > 0) {
        themes = skillsWithKnowledgeObject.map((s) => s.knowledgeObject!).filter(Boolean);
      } else {
        // Fallback: extrair palavras-chave das descrições
        const skills = await prisma.bnccSkill.findMany({
          where: {
            educationLevelId: educationLevel.id,
            ...(gradeId && { gradeId }),
            ...(subjectId && { subjectId }),
            description: { not: '' },
          },
          select: { description: true },
          take: 50,
        });

        const keywords = skills
          .map((s) => {
            const firstSentence = s.description.split('.')[0];
            const words = firstSentence
              .toLowerCase()
              .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, '')
              .split(/\s+/)
              .filter((w) => w.length > 3)
              .slice(0, 3);
            return words.join(' ');
          })
          .filter((k) => k.length > 0);

        themes = [...new Set(keywords)].slice(0, 3);
      }
    } else {
      // Ensino Fundamental: usar knowledgeObject
      const skills = await prisma.bnccSkill.findMany({
        where: {
          educationLevelId: educationLevel.id,
          ...(gradeId && { gradeId }),
          ...(subjectId && { subjectId }),
          knowledgeObject: { not: null },
        },
        select: {
          knowledgeObject: true,
        },
        distinct: ['knowledgeObject'],
        take: 5,
      });

      themes = skills
        .map((s) => s.knowledgeObject!)
        .filter((t) => t.length > 0)
        .map((t) => {
          // Capitalizar primeira letra
          return t.charAt(0).toUpperCase() + t.slice(1);
        });
    }

    // Se não encontrou temas, usar fallback genérico
    if (themes.length === 0) {
      themes = isEI
        ? ['brincadeiras', 'convivência', 'exploração']
        : ['conceitos', 'práticas', 'conhecimento'];
    }

    return NextResponse.json({
      success: true,
      data: {
        themes,
      },
    });
  } catch (error) {
    console.error('[GET /api/v1/bncc/themes] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar temas',
      },
      { status: 500 }
    );
  }
}
