import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import type { EducationLevel, Prisma, Subject } from '@prisma/client'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { ResourceFilterSchema } from '@/lib/schemas/resource'
import { buildResourceCacheTag } from '@/lib/helpers/cache'
import { checkRateLimit } from '@/lib/helpers/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(`resources-counts:${userId}`, { windowMs: 60_000, limit: 60 })
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

    const parsed = ResourceFilterSchema.safeParse({
      tab: searchParams.get('tab') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      educationLevel: searchParams.get('educationLevel') ?? undefined,
      subject: searchParams.get('subject') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    const { tab, q, educationLevel, subject } = parsed.data

    const cacheKey = [
      'resources-count',
      userId,
      `tab:${tab}`,
      q ?? '',
      educationLevel ?? '',
      subject ?? '',
    ]

    const fetchCount = unstable_cache(
      async () => {
        const baseWhere: Prisma.ResourceWhereInput = {}

        if (q) {
          baseWhere.title = { contains: q, mode: 'insensitive' }
        }

        if (educationLevel) {
          baseWhere.educationLevel = educationLevel as EducationLevel
        }

        if (subject) {
          baseWhere.subject = subject as Subject
        }

        if (tab === 'mine') {
          const count = await prisma.resource.count({
            where: {
              ...baseWhere,
              accessEntries: {
                some: {
                  userId,
                  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                },
              },
            },
          })

          return { tab, count }
        }

        if (tab === 'free') {
          const count = await prisma.resource.count({
            where: {
              ...baseWhere,
              isFree: true,
            },
          })

          return { tab, count }
        }

        const count = await prisma.resource.count({ where: baseWhere })

        return { tab, count }
      },
      cacheKey,
      {
        revalidate: 30,
        tags: [buildResourceCacheTag(userId)],
      }
    )

    const result = await fetchCount()

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Erro ao contar recursos:', error)
    return NextResponse.json({ error: 'Erro ao contar recursos' }, { status: 500 })
  }
}
