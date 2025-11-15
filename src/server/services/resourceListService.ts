import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { ResourceFilter, ResourceSchema, type Resource } from '@/lib/schemas/resource'

import {
  buildHasAccessConditionSql,
  type SubscriptionContext,
  type UserAccessContext,
} from './accessService'

export interface ResourceListParams {
  user: UserAccessContext
  subscription: SubscriptionContext
  filters: ResourceFilter
}

export interface ResourceListPagination {
  page: number
  limit: number
  hasMore: boolean
}

export interface ResourceListResult {
  items: Resource[]
  pagination: ResourceListPagination
}

type ResourceRow = {
  id: string
  title: string
  description: string | null
  thumbUrl: string | null
  educationLevel: string
  subject: string
  isFree: boolean
  hasAccess: boolean
}

/**
 * Service responsável por aplicar filtros, ordenação e paginação
 * na listagem de recursos, conforme PRD da tela /resources.
 */
export async function getResourceList({
  user,
  subscription,
  filters,
}: ResourceListParams): Promise<ResourceListResult> {
  const { page, limit, q, educationLevel, subject, tab } = filters

  const limitPlusOne = limit + 1
  const offset = (page - 1) * limit

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

  const hasAccessCondition = buildHasAccessConditionSql(user, subscription)

  if (tab === 'mine') {
    // Meus recursos: apenas itens em que hasAccess é true E nao sao gratuitos
    whereConditions.push(hasAccessCondition)
    whereConditions.push(Prisma.sql`r."isFree" = false`)
  } else if (tab === 'free') {
    // Gratuitos: apenas recursos isFree = true
    whereConditions.push(Prisma.sql`r."isFree" = true`)
  }

  const whereClause = Prisma.join(
    whereConditions.length ? whereConditions : [Prisma.sql`TRUE`],
    ' AND '
  )

  const rows = await prisma.$queryRaw<ResourceRow[]>(Prisma.sql`
    SELECT
      r.id,
      r.title,
      r.description AS description,
      r."thumbUrl" AS "thumbUrl",
      r."educationLevel" AS "educationLevel",
      r."subject" AS "subject",
      r."isFree" AS "isFree",
      ${hasAccessCondition} AS "hasAccess"
    FROM "resource" r
    WHERE ${whereClause}
    ORDER BY
      CASE WHEN ${hasAccessCondition} THEN 1 ELSE 0 END DESC,
      r.title ASC,
      r.id ASC
    LIMIT ${limitPlusOne}
    OFFSET ${offset}
  `)

  const hasMore = rows.length > limit
  const slice = hasMore ? rows.slice(0, limit) : rows

  const parsedItems = slice.map((row) =>
    ResourceSchema.parse({
      id: row.id,
      title: row.title,
      description: row.description,
      thumbUrl: row.thumbUrl,
      educationLevel: row.educationLevel,
      subject: row.subject,
      isFree: row.isFree,
      hasAccess: row.hasAccess,
    })
  )

  return {
    items: parsedItems,
    pagination: {
      page,
      limit,
      hasMore,
    },
  }
}
