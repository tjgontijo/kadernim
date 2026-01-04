import { Prisma as PrismaNamespace } from '@/lib/db'
import type { Prisma } from '@/lib/db'
import { prisma } from '@/lib/db'
import { ResourceFilter, ResourceSchema, type Resource } from '@/lib/schemas/resource'

import {
  buildHasAccessConditionSql,
  type SubscriptionContext,
  type UserAccessContext,
} from '../../auth/access-service'

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
  cloudinaryPublicId: string | null
  imageUrl: string | null
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
  const { page, limit, q, educationLevel, grade, subject, tab } = filters

  const limitPlusOne = limit + 1
  const offset = (page - 1) * limit

  const whereConditions: Prisma.Sql[] = []
  const joins: Prisma.Sql[] = []

  if (q) {
    whereConditions.push(PrismaNamespace.sql`r."title" ILIKE ${`%${q}%`}`)
  }

  if (educationLevel) {
    whereConditions.push(
      PrismaNamespace.sql`el.slug = ${educationLevel}`
    )
  }

  if (grade) {
    joins.push(PrismaNamespace.sql`JOIN "resource_grade" rg ON rg."resourceId" = r.id`)
    joins.push(PrismaNamespace.sql`JOIN "grade" g ON g.id = rg."gradeId"`)
    whereConditions.push(PrismaNamespace.sql`g.slug = ${grade}`)
  }

  if (subject) {
    whereConditions.push(PrismaNamespace.sql`s.slug = ${subject}`)
  }

  const hasAccessCondition = buildHasAccessConditionSql(user, subscription)

  if (tab === 'mine') {
    // Meus recursos: apenas itens em que hasAccess é true E nao sao gratuitos
    whereConditions.push(hasAccessCondition)
    whereConditions.push(PrismaNamespace.sql`r."isFree" = false`)
  } else if (tab === 'free') {
    // Gratuitos: apenas recursos isFree = true
    whereConditions.push(PrismaNamespace.sql`r."isFree" = true`)
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
      (SELECT ri."cloudinaryPublicId" FROM "resource_image" ri WHERE ri."resourceId" = r.id ORDER BY ri."order" ASC LIMIT 1) AS "cloudinaryPublicId",
      (SELECT ri.url FROM "resource_image" ri WHERE ri."resourceId" = r.id ORDER BY ri."order" ASC LIMIT 1) AS "imageUrl",
      el.slug AS "educationLevel",
      s.slug AS "subject",
      r."isFree" AS "isFree",
      ${hasAccessCondition} AS "hasAccess"
    FROM "resource" r
    JOIN "education_level" el ON r."educationLevelId" = el.id
    JOIN "subject" s ON r."subjectId" = s.id
    ${PrismaNamespace.join(joins, ' ')}
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
      thumbUrl: row.imageUrl || (row.cloudinaryPublicId ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${row.cloudinaryPublicId}` : null),
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
