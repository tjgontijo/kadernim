import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { ResourceFilter } from '@/lib/schemas/resource'

import {
  buildHasAccessConditionSql,
  type SubscriptionContext,
  type UserAccessContext,
} from './accessService'

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
    whereConditions.push(Prisma.sql`r."title" ILIKE ${`%${q}%`}`)
  }

  if (educationLevel) {
    whereConditions.push(
      Prisma.sql`r."educationLevel" = CAST(${educationLevel} AS "EducationLevel")`
    )
  }

  if (subject) {
    whereConditions.push(Prisma.sql`r."subject" = CAST(${subject} AS "Subject")`)
  }

  return Prisma.join(whereConditions.length ? whereConditions : [Prisma.sql`TRUE`], ' AND ')
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
    prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      WHERE ${baseWhere}
    `),

    // Aba MINE: apenas recursos nao gratuitos aos quais o usuário tem hasAccess = true
    prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "resource" r
      WHERE ${baseWhere}
        AND ${hasAccessCondition}
        AND r."isFree" = false
    `),

    // Aba FREE: apenas recursos gratuitos
    prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
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
