import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Mapeamento de temas práticos e comuns para professores,
 * fugindo do linguajar excessivamente burocrático da BNCC.
 */
const PRACTICAL_THEMES: Record<string, string[]> = {
  'lingua-portuguesa': ['Alfabetização', 'Leitura e Interpretação', 'Gramática', 'Produção de Texto', 'Contação de Histórias', 'Ortografia'],
  'matematica': ['Tabuada', 'Frações', 'Geometria', 'Raciocínio Lógico', 'Sistema Monetário', 'Soma e Subtração', 'Medidas de Tempo'],
  'ciencias': ['Sistema Solar', 'Meio Ambiente', 'Corpo Humano', 'Animais e Plantas', 'Estados da Água', 'Reciclagem', 'Alimentação Saudável'],
  'historia': ['História do Brasil', 'Povos Indígenas', 'Grandes Navegações', 'Minha Família', 'Dia da Independência', 'Cultura de Paz'],
  'geografia': ['Mapas e Globos', 'Zonas Rurais e Urbanas', 'Clima e Tempo', 'Tipos de Relevo', 'Preservação da Natureza'],
  'arte': ['Pintura e Cores', 'Música e Ritmo', 'Teatro', 'Artesanato', 'Grandes Artistas', 'Folclore'],
  'educacao-fisica': ['Brincadeiras e Jogos', 'Esportes', 'Ginástica', 'Saúde e Movimento', 'Danças Literárias'],
  'lingua-inglesa': ['Colors and Numbers', 'Greetings', 'Family Members', 'Animals', 'Food and Drinks'],
  'ensino-religioso': ['Valores e Respeito', 'Sentimentos', 'Tradições Religiosas', 'Diversidade Cultural', 'Empatia'],
  'educacao-infantil': ['Brincadeiras', 'Identidade e Autonomia', 'Coordenação Motora', 'Cores e Formas', 'Animais', 'Minha Família'],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const educationLevelSlug = searchParams.get('educationLevelSlug');
    const gradeSlug = searchParams.get('gradeSlug');
    const subjectSlug = searchParams.get('subjectSlug');

    if (!educationLevelSlug) {
      return NextResponse.json({ success: false, error: 'educationLevelSlug é obrigatório' }, { status: 400 });
    }

    const educationLevel = await prisma.educationLevel.findUnique({ where: { slug: educationLevelSlug } });
    if (!educationLevel) {
      return NextResponse.json({ success: false, error: 'Etapa não encontrada' }, { status: 404 });
    }

    let gradeId: string | undefined;
    if (gradeSlug) {
      const grade = await prisma.grade.findUnique({ where: { slug: gradeSlug } });
      gradeId = grade?.id;
    }

    let subjectId: string | undefined;
    if (subjectSlug) {
      const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
      subjectId = subject?.id;
    }

    const isEI = educationLevelSlug === 'educacao-infantil';

    // 1. Pegar temas práticos da nossa curadoria
    let suggestions: string[] = [];
    if (isEI) {
      suggestions = [...PRACTICAL_THEMES['educacao-infantil']];
    } else if (subjectSlug && PRACTICAL_THEMES[subjectSlug]) {
      suggestions = [...PRACTICAL_THEMES[subjectSlug]];
    }

    // 2. Buscar da BNCC para complementar ou para casos sem mapping
    const bnccThemes = await prisma.bnccSkill.findMany({
      where: {
        educationLevelId: educationLevel.id,
        ...(gradeId && { gradeId }),
        ...(subjectId && { subjectId }),
        knowledgeObject: {
          not: null,
          notIn: [
            'O eu, o outro e o nós',
            'Corpo, gestos e movimentos',
            'Traços, sons, cores e formas',
            'Escuta, fala, pensamento e imaginação',
            'Espaços, tempos, quantidades, relações e transformações'
          ]
        },
      },
      select: { knowledgeObject: true },
      distinct: ['knowledgeObject'],
      take: 10,
    });

    const processedBncc = bnccThemes
      .map(s => s.knowledgeObject!)
      .filter(t => t.length > 3 && t.length < 40) // Evita textos gigantes da BNCC
      .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

    // Misturar (Prioridade para sugestões práticas)
    let finalThemes = [...suggestions, ...processedBncc];

    // Remover duplicatas e limitar a 5
    finalThemes = [...new Set(finalThemes)].slice(0, 5);

    // Fallback absoluto
    if (finalThemes.length === 0) {
      finalThemes = isEI
        ? ['Brincadeiras', 'Cores', 'Exploração']
        : ['Introdução ao tema', 'Conceitos básicos', 'Atividades práticas'];
    }

    return NextResponse.json({
      success: true,
      data: { themes: finalThemes },
    });

  } catch (error) {
    console.error('[GET /api/v1/bncc/themes] Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar temas' }, { status: 500 });
  }
}
