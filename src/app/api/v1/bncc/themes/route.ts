import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { BnccService } from '@/services/bncc/bncc-service';

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
    let gradeSlug = searchParams.get('gradeSlug');
    let subjectSlug = searchParams.get('subjectSlug');

    if (!educationLevelSlug) {
      return NextResponse.json(
        {
          success: false,
          error: 'educationLevelSlug é obrigatório',
        },
        { status: 400 }
      );
    }

    // Buscar temas únicos (knowledgeObject ou fieldOfExperience para EI)
    const isEI = educationLevelSlug === 'educacao-infantil';

    let themes: string[] = [];

    // Adaptação para Educação Infantil: converter slugs para nomes
    let ageRange: string | null = null;
    let fieldOfExperience: string | null = null;

    if (isEI) {
      // Para EI: gradeSlug = ageRange, subjectSlug = fieldOfExperience (slugificado)
      if (gradeSlug) {
        ageRange = gradeSlug;
        console.log('[EI Themes] ageRange:', ageRange);
      }

      if (subjectSlug) {
        fieldOfExperience = await BnccService.getFieldNameFromSlug(subjectSlug);
        if (fieldOfExperience) {
          console.log('[EI Themes] Match encontrado:', fieldOfExperience);
        } else {
          console.log('[EI Themes] Nenhum match encontrado para:', subjectSlug);
        }
      }

      // Educação Infantil: tentar knowledgeObject primeiro (consistência com EF)
      const skillsWithKnowledgeObject = await prisma.bnccSkill.findMany({
        where: {
          educationLevelSlug,
          ...(ageRange && { ageRange }),
          ...(fieldOfExperience && { fieldOfExperience }),
          knowledgeObject: { not: null },
        },
        select: { knowledgeObject: true },
        distinct: ['knowledgeObject'],
        take: 5,
      });

      if (skillsWithKnowledgeObject.length > 0) {
        themes = skillsWithKnowledgeObject.map((s) => s.knowledgeObject!).filter(Boolean);
        console.log('[EI Themes] Usando knowledgeObject:', themes);
      } else {
        // Fallback: extrair palavras-chave das descrições se knowledgeObject estiver vazio
        const skills = await prisma.bnccSkill.findMany({
          where: {
            educationLevelSlug,
            ...(ageRange && { ageRange }),
            ...(fieldOfExperience && { fieldOfExperience }),
            description: { not: '' },
          },
          select: { description: true },
          take: 50,
        });

        console.log('[EI Themes] Extraindo keywords das descrições. Encontradas:', skills.length);

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
      // Ensino Fundamental: usar knowledgeObject (mais preciso)
      const skills = await prisma.bnccSkill.findMany({
        where: {
          educationLevelSlug,
          ...(gradeSlug && { gradeSlug }),
          ...(subjectSlug && { subjectSlug }),
          knowledgeObject: { not: null },
        },
        select: {
          knowledgeObject: true,
        },
        distinct: ['knowledgeObject'],
        take: 5, // Top 5 objetos de conhecimento
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
