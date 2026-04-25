import { Prisma as PrismaNamespace } from '@/server/db'
import type { Prisma } from '@/server/db'
import { prisma } from '@/server/db'
import { ResourceFilter, ResourceSchema, type Resource } from '@/lib/resources/schemas/resource-schemas'
import { buildAccentRegex } from '@/lib/utils'

import {
  buildHasAccessConditionSql,
  type SubscriptionContext,
  type UserAccessContext,
} from '@/services/auth/access-service'

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
  subjectColor: string | null
  subjectTextColor: string | null
  hasAccess: boolean
  isFavorite: boolean
  isUniversal: boolean
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
  const { page, limit, q, educationLevel, grade, subject, tab } = filters

  const limitPlusOne = limit + 1
  const offset = (page - 1) * limit

  const whereConditions: Prisma.Sql[] = []
  const joins: Prisma.Sql[] = []

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

  const hasAccessCondition = buildHasAccessConditionSql(user, subscription)

  if (tab === 'mine') {
    // Meus recursos: apenas itens em que hasAccess é true
    whereConditions.push(hasAccessCondition)
  } else if (tab === 'favorites') {
    // Favoritos: apenas itens onde isSaved é true na user_resource_interaction
    whereConditions.push(PrismaNamespace.sql`EXISTS (
      SELECT 1 FROM "user_resource_interaction" uri 
      WHERE uri."resourceId" = r.id 
      AND uri."userId" = ${user.userId || ''}::uuid 
      AND uri."isSaved" = TRUE
    )`)
  }

  const whereClause = PrismaNamespace.join(
    whereConditions.length ? whereConditions : [PrismaNamespace.sql`TRUE`],
    ' AND '
  )

  const rows = await prisma.$queryRaw<ResourceRow[]>(PrismaNamespace.sql`
    SELECT
      r.id,
      r.title,
      r.description AS description,
      (SELECT ri.url FROM "resource_image" ri WHERE ri."resourceId" = r.id ORDER BY ri."order" ASC LIMIT 1) AS "thumbUrl",
      COALESCE(el.slug, 'universal') AS "educationLevel",
      COALESCE(s.slug, 'interdisciplinar') AS "subject",
      s."color" AS "subjectColor",
      s."textColor" AS "subjectTextColor",
      ${hasAccessCondition} AS "hasAccess",
      EXISTS (
        SELECT 1 FROM "user_resource_interaction" uri 
        WHERE uri."resourceId" = r.id 
        AND uri."userId" = ${user.userId || ''}::uuid 
        AND uri."isSaved" = TRUE
      ) AS "isFavorite",
      r."isUniversal"
    FROM "resource" r
    LEFT JOIN "education_level" el ON r."educationLevelId" = el.id
    LEFT JOIN "subject" s ON r."subjectId" = s.id
    ${joins.length ? PrismaNamespace.join(joins, ' ') : PrismaNamespace.sql``}
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
      subjectColor: row.subjectColor,
      subjectTextColor: row.subjectTextColor,
      hasAccess: row.hasAccess,
      isFavorite: Boolean(row.isFavorite),
      isUniversal: Boolean(row.isUniversal),
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
