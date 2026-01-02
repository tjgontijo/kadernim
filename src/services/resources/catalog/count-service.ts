import { Prisma as PrismaNamespace } from '@/lib/db'
import type { Prisma } from '@/lib/db'
import { prisma } from '@/lib/db'
import type { ResourceFilter } from '@/lib/schemas/resource'

import {
  buildHasAccessConditionSql,
  type SubscriptionContext,
  type UserAccessContext,
} from '../../auth/access-service'

export interface ResourceCountsParams {
  user: UserAccessContext
  subscription: SubscriptionContext
  filters: Pick<ResourceFilter, 'q' | 'educationLevel' | 'subject'>
}

export interface ResourceCountsResult {
  all: number
  mine: number
  free: number
}

function buildBaseWhereSql(filters: Pick<ResourceFilter, 'q' | 'educationLevel' | 'subject'>): Prisma.Sql {
  const { q, educationLevel, subject } = filters

  const whereConditions: Prisma.Sql[] = []

  if (q) {
    whereConditions.push(PrismaNamespace.sql`r."title" ILIKE ${`%${q}%`}`)
  }

  if (educationLevel) {
    whereConditions.push(
      PrismaNamespace.sql`EXISTS (SELECT 1 FROM education_level el WHERE el.id = r."educationLevelId" AND el.slug = ${educationLevel})`
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
      WHERE ${baseWhere}
    `),

    // Aba MINE: apenas recursos nao gratuitos aos quais o usuário tem hasAccess = true
    prisma.$queryRaw<{ count: bigint }[]>(PrismaNamespace.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      WHERE ${baseWhere}
        AND ${hasAccessCondition}
        AND r."isFree" = false
    `),

    // Aba FREE: apenas recursos gratuitos
    prisma.$queryRaw<{ count: bigint }[]>(PrismaNamespace.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
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
