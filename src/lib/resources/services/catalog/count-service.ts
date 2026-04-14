import { Prisma as PrismaNamespace } from '@/server/db'
import type { Prisma } from '@/server/db'
import { prisma } from '@/server/db'
import type { ResourceFilter } from '@/lib/resources/schemas/resource-schemas'

import {
  buildHasAccessConditionSql,
  type SubscriptionContext,
  type UserAccessContext,
} from '@/services/auth/access-service'

export interface ResourceCountsParams {
  user: UserAccessContext
  subscription: SubscriptionContext
  filters: Pick<ResourceFilter, 'q' | 'educationLevel' | 'grade' | 'subject'>
}

export interface ResourceCountsResult {
  all: number
  mine: number
  free: number
}

function buildBaseWhereSql(filters: Pick<ResourceFilter, 'q' | 'educationLevel' | 'grade' | 'subject'>): Prisma.Sql {
  const { q, educationLevel, grade, subject } = filters

  const whereConditions: Prisma.Sql[] = []

  if (q) {
    const searchPattern = `%${q}%`
    whereConditions.push(
      PrismaNamespace.sql`unaccent(r."title" || ' ' || COALESCE(r."description", '') || ' ' || s."name") ILIKE unaccent(${searchPattern})`
    )
  }

  if (educationLevel) {
    whereConditions.push(
      PrismaNamespace.sql`EXISTS (SELECT 1 FROM education_level el WHERE el.id = r."educationLevelId" AND el.slug = ${educationLevel})`
    )
  }

  if (grade) {
    whereConditions.push(
      PrismaNamespace.sql`EXISTS (
        SELECT 1 FROM "resource_grade" rg 
        JOIN "grade" g ON g.id = rg."gradeId" 
        WHERE rg."resourceId" = r.id AND g.slug = ${grade}
      )`
    )
  }

  if (subject) {
    whereConditions.push(
      PrismaNamespace.sql`EXISTS (SELECT 1 FROM subject s WHERE s.id = r."subjectId" AND s.slug = ${subject})`
    )
  }

  return PrismaNamespace.join(whereConditions.length ? whereConditions : [PrismaNamespace.sql`TRUE`], ' AND ')
}

/**
 * Service responsável por retornar os counts por aba (all, mine, free)
 * conforme PRD da tela /resources.
 */
export async function getResourceCounts({
  user,
  subscription,
  filters,
}: ResourceCountsParams): Promise<ResourceCountsResult> {
  const baseWhere = buildBaseWhereSql(filters)
  const hasAccessCondition = buildHasAccessConditionSql(user, subscription)

  const [allRows, mineRows, freeRows] = await Promise.all([
    // Aba ALL: todo o catálogo filtrado (independente de acesso)
    prisma.$queryRaw<{ count: bigint }[]>(PrismaNamespace.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      JOIN "subject" s ON r."subjectId" = s.id
      WHERE ${baseWhere}
    `),

    // Aba MINE: apenas recursos nao gratuitos aos quais o usuário tem hasAccess = true
    prisma.$queryRaw<{ count: bigint }[]>(PrismaNamespace.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      JOIN "subject" s ON r."subjectId" = s.id
      WHERE ${baseWhere}
        AND ${hasAccessCondition}
        AND r."isFree" = false
    `),

    // Aba FREE: apenas recursos gratuitos
    prisma.$queryRaw<{ count: bigint }[]>(PrismaNamespace.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      JOIN "subject" s ON r."subjectId" = s.id
      WHERE ${baseWhere}
        AND r."isFree" = true
    `),
  ])

  const all = Number(allRows[0]?.count ?? 0)
  const mine = Number(mineRows[0]?.count ?? 0)
  const free = Number(freeRows[0]?.count ?? 0)

  return {
    all,
    mine,
    free,
  }
}
