import { Prisma as PrismaNamespace } from '@/server/db'
import type { Prisma } from '@/server/db'
import { prisma } from '@/server/db'
import type { ResourceFilter } from '@/lib/resources/schemas/resource-schemas'
import { buildAccentRegex } from '@/lib/utils'

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
}

function buildBaseWhereSql(filters: Pick<ResourceFilter, 'q' | 'educationLevel' | 'grade' | 'subject'>): Prisma.Sql {
  const { q, educationLevel, grade, subject } = filters

  const whereConditions: Prisma.Sql[] = []

  if (q) {
    const regexPattern = buildAccentRegex(q)
    whereConditions.push(
      PrismaNamespace.sql`(r."title" ~* ${regexPattern} OR COALESCE(r."description", '') ~* ${regexPattern} OR s."name" ~* ${regexPattern})`
    )
  }

  if (educationLevel) {
    whereConditions.push(
      PrismaNamespace.sql`(r."isUniversal" = TRUE OR r."educationLevelId" = (SELECT id FROM "education_level" WHERE slug = ${educationLevel}) OR EXISTS (
        SELECT 1 FROM "resource_education_level" rel
        JOIN "education_level" el2 ON el2.id = rel."educationLevelId"
        WHERE rel."resourceId" = r.id AND el2.slug = ${educationLevel}
      ))`
    )
  }

  if (grade) {
    whereConditions.push(
      PrismaNamespace.sql`(r."isUniversal" = TRUE OR EXISTS (
        SELECT 1 FROM "resource_grade" rg 
        JOIN "grade" g ON g.id = rg."gradeId" 
        WHERE rg."resourceId" = r.id AND g.slug = ${grade}
      ))`
    )
  }

  if (subject) {
    whereConditions.push(
      PrismaNamespace.sql`(r."isUniversal" = TRUE OR r."subjectId" = (SELECT id FROM "subject" WHERE slug = ${subject}) OR EXISTS (
        SELECT 1 FROM "resource_subject" rs
        JOIN "subject" s2 ON s2.id = rs."subjectId"
        WHERE rs."resourceId" = r.id AND s2.slug = ${subject}
      ))`
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

  const [allRows, mineRows] = await Promise.all([
    // Aba ALL: todo o catálogo filtrado (independente de acesso)
    prisma.$queryRaw<{ count: bigint }[]>(PrismaNamespace.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      LEFT JOIN "subject" s ON r."subjectId" = s.id
      WHERE ${baseWhere}
    `),

    // Aba MINE: apenas recursos aos quais o usuário tem hasAccess = true
    prisma.$queryRaw<{ count: bigint }[]>(PrismaNamespace.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      LEFT JOIN "subject" s ON r."subjectId" = s.id
      WHERE ${baseWhere}
        AND ${hasAccessCondition}
    `),
  ])

  const all = Number(allRows[0]?.count ?? 0)
  const mine = Number(mineRows[0]?.count ?? 0)

  return {
    all,
    mine,
  }
}
