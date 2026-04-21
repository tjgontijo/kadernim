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
  windowDays: number
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
  windowDays,
  limit,
}: ResourceHighlightsParams): Promise<ResourceHighlight[]> {
  const hasAccessCondition = buildHasAccessConditionSql(user, subscription)
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)

  const rows = await prisma.$queryRaw<ResourceHighlightRow[]>(PrismaNamespace.sql`
    WITH ranking AS (
      SELECT
        uri."resourceId" AS "resourceId",
        COUNT(*)::int AS "recentDownloads",
        MAX(uri."downloadedAt") AS "lastDownloadedAt"
      FROM "user_resource_interaction" uri
      WHERE uri."downloadedAt" IS NOT NULL
        AND uri."downloadedAt" >= ${windowStart}
      GROUP BY uri."resourceId"
      ORDER BY
        COUNT(*) DESC,
        MAX(uri."downloadedAt") DESC,
        uri."resourceId" ASC
      LIMIT ${limit}
    )
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
        ORDER BY ranking."recentDownloads" DESC, ranking."lastDownloadedAt" DESC, r.id ASC
      )::int AS "rank",
      ranking."recentDownloads" AS "recentDownloads"
    FROM ranking
    JOIN "resource" r ON r.id = ranking."resourceId"
    JOIN "education_level" el ON r."educationLevelId" = el.id
    JOIN "subject" s ON r."subjectId" = s.id
    ORDER BY "rank" ASC
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
