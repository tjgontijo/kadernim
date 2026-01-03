import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * GET /api/v1/bncc/skills
 *
 * Busca habilidades BNCC com busca híbrida (FTS + Embeddings)
 *
 * Query params:
 *   - q: string (termo de busca)
 *   - searchMode: 'fts' | 'semantic' | 'hybrid' (padrão: 'hybrid')
 *   - educationLevelSlug?: string (filtra por etapa)
 *   - gradeSlug?: string (filtra por ano - EF)
 *   - subjectSlug?: string (filtra por disciplina - EF)
 *   - ageRange?: string (filtra por faixa etária - EI)
 *   - fieldOfExperience?: string (filtra por campo de experiência - EI)
 *   - limit?: number (padrão: 50, máximo: 100)
 *
 * Modos de busca:
 *   - fts: Apenas Full-Text Search (rápido, exato)
 *   - semantic: Apenas embeddings (semântico, encontra sinônimos)
 *   - hybrid: Combina FTS (peso 0.6) + embeddings (peso 0.4)
 *
 * Exemplos:
 *   - GET /api/v1/bncc/skills?q=fração&gradeSlug=3-ano&subjectSlug=matematica
 *   - GET /api/v1/bncc/skills?q=soma&searchMode=semantic (encontra "adição", "operações")
 *   - GET /api/v1/bncc/skills?q=criatividade&ageRange=4-5-anos&searchMode=hybrid
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q');
    const searchMode = (searchParams.get('searchMode') || 'hybrid') as 'fts' | 'semantic' | 'hybrid';
    const educationLevelSlug = searchParams.get('educationLevelSlug');
    const gradeSlug = searchParams.get('gradeSlug');
    const subjectSlug = searchParams.get('subjectSlug');
    const ageRange = searchParams.get('ageRange');
    const fieldOfExperience = searchParams.get('fieldOfExperience');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    // Validação: busca requer query
    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetro "q" (busca) é obrigatório',
        },
        { status: 400 }
      );
    }

    // Modo 1: Full-Text Search (FTS)
    if (searchMode === 'fts') {
      const skills = await searchWithFTS({
        q,
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
        ageRange,
        fieldOfExperience,
        limit,
      });

      return NextResponse.json({
        success: true,
        data: skills,
        mode: 'fts',
      });
    }

    // Modo 2: Semantic Search (Embeddings)
    if (searchMode === 'semantic') {
      const skills = await searchWithEmbeddings({
        q,
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
        ageRange,
        fieldOfExperience,
        limit,
      });

      return NextResponse.json({
        success: true,
        data: skills,
        mode: 'semantic',
      });
    }

    // Modo 3: Hybrid (FTS 60% + Embeddings 40%)
    const skills = await searchHybrid({
      q,
      educationLevelSlug,
      gradeSlug,
      subjectSlug,
      ageRange,
      fieldOfExperience,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: skills,
      mode: 'hybrid',
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

// ==================== HELPERS ====================

interface SearchParams {
  q: string;
  educationLevelSlug: string | null;
  gradeSlug: string | null;
  subjectSlug: string | null;
  ageRange: string | null;
  fieldOfExperience: string | null;
  limit: number;
}

/**
 * Busca FTS usando PostgreSQL Full-Text Search
 * Usa ts_rank para ordenar por relevância
 */
async function searchWithFTS(params: SearchParams) {
  const { q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit } = params;

  // Montar WHERE clause dinâmico
  const whereConditions: string[] = [];
  const whereParams: any[] = [];
  let paramIndex = 1;

  // Busca FTS (obrigatória) - usa unaccent para ignorar acentos
  whereConditions.push(`"searchVector" @@ plainto_tsquery('portuguese', unaccent($${paramIndex}))`);
  whereParams.push(q);
  paramIndex++;

  // Filtros opcionais
  if (educationLevelSlug) {
    whereConditions.push(`"educationLevelSlug" = $${paramIndex}`);
    whereParams.push(educationLevelSlug);
    paramIndex++;
  }

  if (gradeSlug) {
    whereConditions.push(`"gradeSlug" = $${paramIndex}`);
    whereParams.push(gradeSlug);
    paramIndex++;
  }

  if (subjectSlug) {
    whereConditions.push(`"subjectSlug" = $${paramIndex}`);
    whereParams.push(subjectSlug);
    paramIndex++;
  }

  if (ageRange) {
    whereConditions.push(`"ageRange" = $${paramIndex}`);
    whereParams.push(ageRange);
    paramIndex++;
  }

  if (fieldOfExperience) {
    whereConditions.push(`"fieldOfExperience" = $${paramIndex}`);
    whereParams.push(fieldOfExperience);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Query com ts_rank para relevância
  const query = `
    SELECT
      id,
      code,
      "educationLevelSlug",
      "fieldOfExperience",
      "ageRange",
      "gradeSlug",
      "subjectSlug",
      "unitTheme",
      "knowledgeObject",
      description,
      comments,
      "curriculumSuggestions",
      ts_rank("searchVector", plainto_tsquery('portuguese', unaccent($1))) as rank
    FROM "bncc_skill"
    ${whereClause}
    ORDER BY rank DESC
    LIMIT $${paramIndex}
  `;

  whereParams.push(limit);

  const skills = await prisma.$queryRawUnsafe<any[]>(query, ...whereParams);

  return skills.map((skill) => ({
    id: skill.id,
    code: skill.code,
    educationLevelSlug: skill.educationLevelSlug,
    fieldOfExperience: skill.fieldOfExperience,
    ageRange: skill.ageRange,
    gradeSlug: skill.gradeSlug,
    subjectSlug: skill.subjectSlug,
    unitTheme: skill.unitTheme,
    knowledgeObject: skill.knowledgeObject,
    description: skill.description,
    comments: skill.comments,
    curriculumSuggestions: skill.curriculumSuggestions,
    relevance: Number(skill.rank),
  }));
}

/**
 * Busca semântica usando embeddings (cosine similarity)
 */
async function searchWithEmbeddings(params: SearchParams) {
  const { q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit } = params;

  // Gerar embedding da query
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: [q],
  });
  const queryEmbedding = embeddings[0];
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  // Montar WHERE clause dinâmico
  const whereConditions: string[] = [];
  const whereParams: any[] = [];
  let paramIndex = 2; // $1 é o vector

  // Filtros opcionais
  if (educationLevelSlug) {
    whereConditions.push(`"educationLevelSlug" = $${paramIndex}`);
    whereParams.push(educationLevelSlug);
    paramIndex++;
  }

  if (gradeSlug) {
    whereConditions.push(`"gradeSlug" = $${paramIndex}`);
    whereParams.push(gradeSlug);
    paramIndex++;
  }

  if (subjectSlug) {
    whereConditions.push(`"subjectSlug" = $${paramIndex}`);
    whereParams.push(subjectSlug);
    paramIndex++;
  }

  if (ageRange) {
    whereConditions.push(`"ageRange" = $${paramIndex}`);
    whereParams.push(ageRange);
    paramIndex++;
  }

  if (fieldOfExperience) {
    whereConditions.push(`"fieldOfExperience" = $${paramIndex}`);
    whereParams.push(fieldOfExperience);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Query com cosine similarity (1 - cosine_distance)
  const query = `
    SELECT
      id,
      code,
      "educationLevelSlug",
      "fieldOfExperience",
      "ageRange",
      "gradeSlug",
      "subjectSlug",
      "unitTheme",
      "knowledgeObject",
      description,
      comments,
      "curriculumSuggestions",
      1 - (embedding <=> $1::vector(1536)) as similarity
    FROM "bncc_skill"
    ${whereClause}
    ORDER BY embedding <=> $1::vector(1536)
    LIMIT $${paramIndex}
  `;

  whereParams.unshift(vectorLiteral);
  whereParams.push(limit);

  const skills = await prisma.$queryRawUnsafe<any[]>(query, ...whereParams);

  return skills.map((skill) => ({
    id: skill.id,
    code: skill.code,
    educationLevelSlug: skill.educationLevelSlug,
    fieldOfExperience: skill.fieldOfExperience,
    ageRange: skill.ageRange,
    gradeSlug: skill.gradeSlug,
    subjectSlug: skill.subjectSlug,
    unitTheme: skill.unitTheme,
    knowledgeObject: skill.knowledgeObject,
    description: skill.description,
    comments: skill.comments,
    curriculumSuggestions: skill.curriculumSuggestions,
    relevance: Number(skill.similarity),
  }));
}

/**
 * Busca híbrida: combina FTS (60%) + Embeddings (40%)
 * Score final = (ts_rank * 0.6) + (similarity * 0.4)
 */
async function searchHybrid(params: SearchParams) {
  const { q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit } = params;

  // Gerar embedding da query
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: [q],
  });
  const queryEmbedding = embeddings[0];
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  // Montar WHERE clause dinâmico
  const whereConditions: string[] = [];
  const whereParams: any[] = [];
  let paramIndex = 3; // $1 = vector, $2 = q

  // FTS: deve ter correspondência - usa unaccent para ignorar acentos
  whereConditions.push(`"searchVector" @@ plainto_tsquery('portuguese', unaccent($2))`);

  // Filtros opcionais
  if (educationLevelSlug) {
    whereConditions.push(`"educationLevelSlug" = $${paramIndex}`);
    whereParams.push(educationLevelSlug);
    paramIndex++;
  }

  if (gradeSlug) {
    whereConditions.push(`"gradeSlug" = $${paramIndex}`);
    whereParams.push(gradeSlug);
    paramIndex++;
  }

  if (subjectSlug) {
    whereConditions.push(`"subjectSlug" = $${paramIndex}`);
    whereParams.push(subjectSlug);
    paramIndex++;
  }

  if (ageRange) {
    whereConditions.push(`"ageRange" = $${paramIndex}`);
    whereParams.push(ageRange);
    paramIndex++;
  }

  if (fieldOfExperience) {
    whereConditions.push(`"fieldOfExperience" = $${paramIndex}`);
    whereParams.push(fieldOfExperience);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Query híbrida: combina ts_rank (60%) + similarity (40%)
  const query = `
    SELECT
      id,
      code,
      "educationLevelSlug",
      "fieldOfExperience",
      "ageRange",
      "gradeSlug",
      "subjectSlug",
      "unitTheme",
      "knowledgeObject",
      description,
      comments,
      "curriculumSuggestions",
      (
        ts_rank("searchVector", plainto_tsquery('portuguese', unaccent($2))) * 0.6 +
        (1 - (embedding <=> $1::vector(1536))) * 0.4
      ) as hybrid_score
    FROM "bncc_skill"
    ${whereClause}
    ORDER BY hybrid_score DESC
    LIMIT $${paramIndex}
  `;

  whereParams.unshift(vectorLiteral, q);
  whereParams.push(limit);

  const skills = await prisma.$queryRawUnsafe<any[]>(query, ...whereParams);

  return skills.map((skill) => ({
    id: skill.id,
    code: skill.code,
    educationLevelSlug: skill.educationLevelSlug,
    fieldOfExperience: skill.fieldOfExperience,
    ageRange: skill.ageRange,
    gradeSlug: skill.gradeSlug,
    subjectSlug: skill.subjectSlug,
    unitTheme: skill.unitTheme,
    knowledgeObject: skill.knowledgeObject,
    description: skill.description,
    comments: skill.comments,
    curriculumSuggestions: skill.curriculumSuggestions,
    relevance: Number(skill.hybrid_score),
  }));
}
