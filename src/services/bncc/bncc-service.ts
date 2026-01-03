import { prisma } from '@/lib/db';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface BnccSkillResult {
    id: string;
    code: string;
    educationLevelSlug: string;
    fieldOfExperience?: string | null;
    ageRange?: string | null;
    gradeSlug?: string | null;
    subjectSlug?: string | null;
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
    gradeSlug?: string | null;
    subjectSlug?: string | null;
    ageRange?: string | null;
    fieldOfExperience?: string | null;
    limit?: number;
}

export class BnccService {
    /**
     * Converte um slug de campo de experiência no nome real salvo no banco
     */
    static async getFieldNameFromSlug(slug: string): Promise<string | null> {
        const allFields = await prisma.bnccSkill.findMany({
            where: {
                educationLevelSlug: 'educacao-infantil',
                fieldOfExperience: { not: null },
            },
            select: { fieldOfExperience: true },
            distinct: ['fieldOfExperience'],
        });

        const matched = allFields.find((f) => {
            const s = f.fieldOfExperience!
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            return s === slug;
        });

        return matched?.fieldOfExperience || null;
    }

    /**
     * Busca habilidades com filtros e busca híbrida
     */
    static async searchSkills(params: BnccSearchParams): Promise<BnccSkillResult[]> {
        const { q, educationLevelSlug, limit = 50 } = params;
        let { gradeSlug, subjectSlug, ageRange, fieldOfExperience, searchMode = 'hybrid' } = params;

        const isEI = educationLevelSlug === 'educacao-infantil';

        // Normalização de EI
        if (isEI) {
            if (gradeSlug && !ageRange) {
                ageRange = gradeSlug;
                gradeSlug = null;
            }
            if (subjectSlug && !fieldOfExperience) {
                fieldOfExperience = await this.getFieldNameFromSlug(subjectSlug);
                subjectSlug = null;
            }
        }

        // Se não tiver busca textual, faz busca simples
        if (!q || q.trim().length === 0) {
            return this.fetchByFilters({
                educationLevelSlug,
                gradeSlug,
                subjectSlug,
                ageRange,
                fieldOfExperience,
                limit,
            });
        }

        // Escolher modo de busca
        if (searchMode === 'fts') {
            return this.searchFTS({ q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit });
        }

        if (searchMode === 'semantic') {
            return this.searchSemantic({ q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit });
        }

        return this.searchHybrid({ q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit });
    }

    private static async fetchByFilters(params: any): Promise<BnccSkillResult[]> {
        const { educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit } = params;

        const where: any = {
            ...(educationLevelSlug && { educationLevelSlug }),
            ...(gradeSlug && { gradeSlug }),
            ...(subjectSlug && { subjectSlug }),
            ...(ageRange && { ageRange }),
            ...(fieldOfExperience && { fieldOfExperience }),
        };

        const skills = await prisma.bnccSkill.findMany({
            where,
            orderBy: { code: 'asc' },
            take: limit,
        });

        return skills.map(s => ({ ...s, relevance: 1 }));
    }

    private static async searchHybrid(params: any): Promise<BnccSkillResult[]> {
        const { q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit } = params;

        const { embeddings } = await embedMany({
            model: openai.embedding('text-embedding-3-small'),
            values: [q],
        });
        const queryEmbedding = embeddings[0];
        const vectorLiteral = `[${queryEmbedding.join(',')}]`;

        const whereConditions: string[] = [];
        const whereParams: any[] = [vectorLiteral, q];
        let pIdx = 3;

        if (educationLevelSlug) { whereConditions.push(`"educationLevelSlug" = $${pIdx}`); whereParams.push(educationLevelSlug); pIdx++; }
        if (gradeSlug) { whereConditions.push(`"gradeSlug" = $${pIdx}`); whereParams.push(gradeSlug); pIdx++; }
        if (subjectSlug) { whereConditions.push(`"subjectSlug" = $${pIdx}`); whereParams.push(subjectSlug); pIdx++; }
        if (ageRange) { whereConditions.push(`"ageRange" = $${pIdx}`); whereParams.push(ageRange); pIdx++; }
        if (fieldOfExperience) { whereConditions.push(`"fieldOfExperience" = $${pIdx}`); whereParams.push(fieldOfExperience); pIdx++; }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
      SELECT *, (
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
        // Implementação simplificada delegando ao searchHybrid com peso total no FTS se necessário, 
        // mas por enquanto mantemos a lógica isolada se o usuário pedir explicitamente FTS
        const { q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit } = params;

        const whereConditions: string[] = [`"searchVector" @@ plainto_tsquery('portuguese', unaccent($1))`];
        const whereParams: any[] = [q];
        let pIdx = 2;

        if (educationLevelSlug) { whereConditions.push(`"educationLevelSlug" = $${pIdx}`); whereParams.push(educationLevelSlug); pIdx++; }
        if (gradeSlug) { whereConditions.push(`"gradeSlug" = $${pIdx}`); whereParams.push(gradeSlug); pIdx++; }
        if (subjectSlug) { whereConditions.push(`"subjectSlug" = $${pIdx}`); whereParams.push(subjectSlug); pIdx++; }
        if (ageRange) { whereConditions.push(`"ageRange" = $${pIdx}`); whereParams.push(ageRange); pIdx++; }
        if (fieldOfExperience) { whereConditions.push(`"fieldOfExperience" = $${pIdx}`); whereParams.push(fieldOfExperience); pIdx++; }

        const query = `
      SELECT *, ts_rank("searchVector", plainto_tsquery('portuguese', unaccent($1))) as relevance
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
        const { q, educationLevelSlug, gradeSlug, subjectSlug, ageRange, fieldOfExperience, limit } = params;

        const { embeddings } = await embedMany({
            model: openai.embedding('text-embedding-3-small'),
            values: [q],
        });
        const queryEmbedding = embeddings[0];
        const vectorLiteral = `[${queryEmbedding.join(',')}]`;

        const whereConditions: string[] = [];
        const whereParams: any[] = [vectorLiteral];
        let pIdx = 2;

        if (educationLevelSlug) { whereConditions.push(`"educationLevelSlug" = $${pIdx}`); whereParams.push(educationLevelSlug); pIdx++; }
        if (gradeSlug) { whereConditions.push(`"gradeSlug" = $${pIdx}`); whereParams.push(gradeSlug); pIdx++; }
        if (subjectSlug) { whereConditions.push(`"subjectSlug" = $${pIdx}`); whereParams.push(subjectSlug); pIdx++; }
        if (ageRange) { whereConditions.push(`"ageRange" = $${pIdx}`); whereParams.push(ageRange); pIdx++; }
        if (fieldOfExperience) { whereConditions.push(`"fieldOfExperience" = $${pIdx}`); whereParams.push(fieldOfExperience); pIdx++; }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
      SELECT *, 1 - (embedding <=> $1::vector(1536)) as relevance
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
