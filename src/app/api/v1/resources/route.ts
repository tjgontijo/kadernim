import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { ResourceFilterSchema } from '@/lib/schemas/resource'
import {
  buildResourceCacheKey,
  buildResourceCacheTag,
} from '@/lib/helpers/cache'
import { checkRateLimit } from '@/lib/helpers/rate-limit'

type ResourceRow = {
  id: string
  title: string
  thumbUrl: string | null
  educationLevel: string
  subject: string
  description: string | null
  isFree: boolean
  hasAccess: boolean
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(`resources:${userId}`, { windowMs: 60_000, limit: 60 })
    if (!rl.allowed) {
      return new NextResponse(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter),
        },
      })
    }

    const searchParams = request.nextUrl.searchParams
    
    // Validar e parsear query params com Zod
    const parsed = ResourceFilterSchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      educationLevel: searchParams.get('educationLevel') ?? undefined,
      subject: searchParams.get('subject') ?? undefined,
      tab: searchParams.get('tab') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    const { page, limit, q, educationLevel, subject, tab } = parsed.data
    const limitPlusOne = limit + 1
    const offset = (page - 1) * limit

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    })

    const hasFullAccess = Boolean(activeSubscription)

    const cacheKey = buildResourceCacheKey({
      userId,
      isSubscriber: hasFullAccess,
      filters: { q, educationLevel, subject, tab, page, limit },
    })

    const fetchResources = unstable_cache(
      async () => {
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

        if (tab === 'mine') {
          whereConditions.push(Prisma.sql`${Prisma.sql`(
            EXISTS(
              SELECT 1
              FROM "user_resource_access" ura
              WHERE ura."resourceId" = r.id
                AND ura."userId" = ${userId}
                AND (ura."expiresAt" IS NULL OR ura."expiresAt" > NOW())
            )
          )`}`)
        } else if (tab === 'free') {
          whereConditions.push(Prisma.sql`r."isFree" = true`)
        }

        const whereClause = Prisma.join(
          whereConditions.length ? whereConditions : [Prisma.sql`TRUE`],
          ' AND '
        )

        const hasAccessCondition = Prisma.sql`(
          r."isFree"
          OR ${hasFullAccess}
          OR EXISTS(
            SELECT 1
            FROM "user_resource_access" ura
            WHERE ura."resourceId" = r.id
              AND ura."userId" = ${userId}
              AND (ura."expiresAt" IS NULL OR ura."expiresAt" > NOW())
          )
        )`

        const rows = await prisma.$queryRaw<ResourceRow[]>(Prisma.sql`
          SELECT
            r.id,
            r.title,
            r."thumbUrl" AS "thumbUrl",
            r."educationLevel" AS "educationLevel",
            r."subject" AS "subject",
            r.description AS description,
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
        const data = hasMore ? rows.slice(0, limit) : rows

        return {
          data,
          pagination: {
            page,
            limit,
            hasMore,
          },
        }
      },
      cacheKey,
      {
        revalidate: 30,
        tags: [buildResourceCacheTag(userId)],
      }
    )

    const { data, pagination } = await fetchResources()

    return NextResponse.json({ data, pagination })
  } catch (error) {
    console.error('Erro ao buscar recursos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar recursos' },
      { status: 500 }
    )
  }
}
