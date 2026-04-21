import { Prisma as PrismaNamespace } from '@/server/db'
import type { Prisma } from '@/server/db'
import { prisma } from '@/server/db'
import { ResourceSchema, type Resource } from '@/lib/resources/schemas/resource-schemas'
import {
  buildHasAccessConditionSql,
  type SubscriptionContext,
  type UserAccessContext,
} from '@/services/auth/access-service'

export interface ResourceHighlight extends Resource {
  rank: number
  recentDownloads: number
}

export interface ResourceHighlightsParams {
  user: UserAccessContext
  subscription: SubscriptionContext
  periodStart: Date
  limit: number
}

type ResourceHighlightRow = {
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
  rank: number
  recentDownloads: number
}

export async function getResourceHighlights({
  user,
  subscription,
  periodStart,
  limit,
}: ResourceHighlightsParams): Promise<ResourceHighlight[]> {
  const hasAccessCondition = buildHasAccessConditionSql(user, subscription)

  const rows = await prisma.$queryRaw<ResourceHighlightRow[]>(PrismaNamespace.sql`
    SELECT
      r.id,
      r.title,
      r.description AS description,
      (SELECT ri.url FROM "resource_image" ri WHERE ri."resourceId" = r.id ORDER BY ri."order" ASC LIMIT 1) AS "thumbUrl",
      el.slug AS "educationLevel",
      s.slug AS "subject",
      s."color" AS "subjectColor",
      s."textColor" AS "subjectTextColor",
      ${hasAccessCondition} AS "hasAccess",
      EXISTS (
        SELECT 1 FROM "user_resource_interaction" uri
        WHERE uri."resourceId" = r.id
          AND uri."userId" = ${user.userId}::uuid
          AND uri."isSaved" = TRUE
      ) AS "isFavorite",
      ROW_NUMBER() OVER (
        ORDER BY COUNT(recent_uri.id) DESC, MAX(recent_uri."downloadedAt") DESC NULLS LAST, r."downloadCount" DESC, r.title ASC, r.id ASC
      )::int AS "rank",
      COUNT(recent_uri.id)::int AS "recentDownloads"
    FROM "resource" r
    JOIN "education_level" el ON r."educationLevelId" = el.id
    JOIN "subject" s ON r."subjectId" = s.id
    LEFT JOIN "user_resource_interaction" recent_uri
      ON recent_uri."resourceId" = r.id
      AND recent_uri."downloadedAt" IS NOT NULL
      AND recent_uri."downloadedAt" >= ${periodStart}
    GROUP BY
      r.id,
      r.title,
      r.description,
      r."downloadCount",
      el.slug,
      s.slug,
      s."color",
      s."textColor"
    ORDER BY "rank" ASC
    LIMIT ${limit}
  `)

  return rows.map((row) => {
    const resource = ResourceSchema.parse({
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
    })

    return {
      ...resource,
      rank: row.rank,
      recentDownloads: row.recentDownloads,
    }
  })
}
