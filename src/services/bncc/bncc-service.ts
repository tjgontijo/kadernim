import { prisma } from '@/lib/db';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface BnccSkillResult {
    id: string;
    code: string;
    educationLevelId: string;
    gradeId?: string | null;
    subjectId?: string | null;
    unitTheme?: string | null;
    knowledgeObject?: string | null;
    description: string;
    comments?: string | null;
    curriculumSuggestions?: string | null;
    relevance: number;
}

export interface BnccSearchParams {
    q?: string | null;
    searchMode?: 'fts' | 'semantic' | 'hybrid';
    educationLevelSlug?: string | null;
    gradeSlugs?: string[] | null;
    subjectSlug?: string | null;
    limit?: number;
}

export class BnccService {
    /**
     * Busca habilidades com filtros e busca híbrida
     */
    static async searchSkills(params: BnccSearchParams): Promise<BnccSkillResult[]> {
        const { q, educationLevelSlug, gradeSlugs, subjectSlug, limit = 50, searchMode = 'hybrid' } = params;

        // Resolver slugs para IDs
        const educationLevelId = educationLevelSlug
            ? (await prisma.educationLevel.findUnique({ where: { slug: educationLevelSlug } }))?.id
            : undefined;

        const gradeIds = gradeSlugs?.length
            ? (await prisma.grade.findMany({
                where: { slug: { in: gradeSlugs } },
                select: { id: true }
            })).map(g => g.id)
            : undefined;

        const subjectId = subjectSlug
            ? (await prisma.subject.findUnique({ where: { slug: subjectSlug } }))?.id
            : undefined;

        // Se não tiver busca textual, faz busca simples
        if (!q || q.trim().length === 0) {
            return this.fetchByFilters({ educationLevelId, gradeIds, subjectId, limit });
        }

        // Escolher modo de busca
        if (searchMode === 'fts') {
            return this.searchFTS({ q, educationLevelId, gradeIds, subjectId, limit });
        }

        if (searchMode === 'semantic') {
            return this.searchSemantic({ q, educationLevelId, gradeIds, subjectId, limit });
        }

        return this.searchHybrid({ q, educationLevelId, gradeIds, subjectId, limit });
    }

    private static async fetchByFilters(params: any): Promise<BnccSkillResult[]> {
        const { educationLevelId, gradeIds, subjectId, limit } = params;

        const where: any = {
            ...(educationLevelId && { educationLevelId }),
            ...(gradeIds?.length && { gradeId: { in: gradeIds } }),
            ...(subjectId && { subjectId }),
        };

        const skills = await prisma.bnccSkill.findMany({
            where,
            orderBy: { code: 'asc' },
            take: limit,
        });

        return skills.map(s => ({ ...s, relevance: 1 }));
    }

    private static async searchHybrid(params: any): Promise<BnccSkillResult[]> {
        const { q, educationLevelId, gradeIds, subjectId, limit } = params;

        const { embeddings } = await embedMany({
            model: openai.embedding('text-embedding-3-small'),
            values: [q],
        });
        const queryEmbedding = embeddings[0];
        const vectorLiteral = `[${queryEmbedding.join(',')}]`;

        const whereConditions: string[] = [];
        const whereParams: any[] = [vectorLiteral, q];
        let pIdx = 3;

        if (educationLevelId) { whereConditions.push(`"educationLevelId" = $${pIdx}`); whereParams.push(educationLevelId); pIdx++; }
        if (gradeIds?.length) { whereConditions.push(`"gradeId" = ANY($${pIdx})`); whereParams.push(gradeIds); pIdx++; }
        if (subjectId) { whereConditions.push(`"subjectId" = $${pIdx}`); whereParams.push(subjectId); pIdx++; }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
      SELECT
        id, code, "educationLevelId", "gradeId", "subjectId",
        "unitTheme", "knowledgeObject",
        description, comments, "curriculumSuggestions", "createdAt", "updatedAt",
        (
          COALESCE(CASE WHEN "searchVector" @@ plainto_tsquery('portuguese', unaccent($2))
            THEN ts_rank("searchVector", plainto_tsquery('portuguese', unaccent($2))) * 0.4 ELSE 0 END, 0) +
          (1 - (embedding <=> $1::vector(1536))) * 0.6
        ) as relevance
      FROM "bncc_skill"
      ${whereClause}
      ORDER BY relevance DESC
      LIMIT $${pIdx}
    `;

        whereParams.push(limit);
        const results = await prisma.$queryRawUnsafe<any[]>(query, ...whereParams);
        return results.map(r => ({ ...r, relevance: Number(r.relevance) }));
    }

    private static async searchFTS(params: any): Promise<BnccSkillResult[]> {
        const { q, educationLevelId, gradeIds, subjectId, limit } = params;

        const whereConditions: string[] = [`"searchVector" @@ plainto_tsquery('portuguese', unaccent($1))`];
        const whereParams: any[] = [q];
        let pIdx = 2;

        if (educationLevelId) { whereConditions.push(`"educationLevelId" = $${pIdx}`); whereParams.push(educationLevelId); pIdx++; }
        if (gradeIds?.length) { whereConditions.push(`"gradeId" = ANY($${pIdx})`); whereParams.push(gradeIds); pIdx++; }
        if (subjectId) { whereConditions.push(`"subjectId" = $${pIdx}`); whereParams.push(subjectId); pIdx++; }

        const query = `
      SELECT
        id, code, "educationLevelId", "gradeId", "subjectId",
        "unitTheme", "knowledgeObject",
        description, comments, "curriculumSuggestions", "createdAt", "updatedAt",
        ts_rank("searchVector", plainto_tsquery('portuguese', unaccent($1))) as relevance
      FROM "bncc_skill"
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY relevance DESC
      LIMIT $${pIdx}
    `;

        whereParams.push(limit);
        const results = await prisma.$queryRawUnsafe<any[]>(query, ...whereParams);
        return results.map(r => ({ ...r, relevance: Number(r.relevance) }));
    }

    private static async searchSemantic(params: any): Promise<BnccSkillResult[]> {
        const { q, educationLevelId, gradeIds, subjectId, limit } = params;

        const { embeddings } = await embedMany({
            model: openai.embedding('text-embedding-3-small'),
            values: [q],
        });
        const queryEmbedding = embeddings[0];
        const vectorLiteral = `[${queryEmbedding.join(',')}]`;

        const whereConditions: string[] = [];
        const whereParams: any[] = [vectorLiteral];
        let pIdx = 2;

        if (educationLevelId) { whereConditions.push(`"educationLevelId" = $${pIdx}`); whereParams.push(educationLevelId); pIdx++; }
        if (gradeIds?.length) { whereConditions.push(`"gradeId" = ANY($${pIdx})`); whereParams.push(gradeIds); pIdx++; }
        if (subjectId) { whereConditions.push(`"subjectId" = $${pIdx}`); whereParams.push(subjectId); pIdx++; }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
      SELECT
        id, code, "educationLevelId", "gradeId", "subjectId",
        "unitTheme", "knowledgeObject",
        description, comments, "curriculumSuggestions", "createdAt", "updatedAt",
        1 - (embedding <=> $1::vector(1536)) as relevance
      FROM "bncc_skill"
      ${whereClause}
      ORDER BY relevance DESC
      LIMIT $${pIdx}
    `;

        whereParams.push(limit);
        const results = await prisma.$queryRawUnsafe<any[]>(query, ...whereParams);
        return results.map(r => ({ ...r, relevance: Number(r.relevance) }));
    }
}
