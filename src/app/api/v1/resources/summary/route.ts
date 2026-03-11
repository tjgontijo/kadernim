import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/server/auth/auth'
import { ResourceFilterSchema } from '@/schemas/resources/resource-schemas'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { buildResourceCacheKey } from '@/server/utils/cache'
import {
  getResourceAccessContext,
  getResourceMetaForUser,
  getResourceSummary,
} from '@/services/resources/catalog'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id ?? null
    const role = session?.user?.role ?? null

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(`resources-summary:${userId}`, {
      windowMs: 60_000,
      limit: 60,
    })

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
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      educationLevel: searchParams.get('educationLevel') ?? undefined,
      grade: searchParams.get('grade') ?? undefined,
      subject: searchParams.get('subject') ?? undefined,
      tab: searchParams.get('tab') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    const filters = parsed.data
    const access = await getResourceAccessContext(userId, role)
    const userMeta = await getResourceMetaForUser(userId, role)

    const cacheKey = buildResourceCacheKey({
      userId,
      isSubscriber: access.subscription.hasActiveSubscription,
      filters,
    })

    const summary = await getResourceSummary({
      user: access.user,
      subscription: access.subscription,
      filters,
      userMeta,
    })

    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
        'CDN-Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
        'Vary': 'Authorization, Cookie',
        'X-Resource-Cache-Key': cacheKey.join(':'),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar resumo de recursos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar recursos' },
      { status: 500 }
    )
  }
}
