import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { auth } from '@/server/auth/auth'
import { isStaff } from '@/lib/auth/roles'
import { ResourceFilterSchema } from '@/lib/schemas/resource'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { buildResourceCacheKey } from '@/server/utils/cache'

import { getResourceSummary } from '@/services/resources/catalog/summary-service'
import type {
  SubscriptionContext,
  UserAccessContext,
} from '@/services/auth/access-service'

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

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    })

    const isAdmin = isStaff(role as any)
    const isSubscriber = Boolean(subscription)

    const userContext: UserAccessContext = {
      userId,
      isAdmin,
    }

    const subscriptionContext: SubscriptionContext = {
      hasActiveSubscription: isSubscriber,
    }

    const userMeta = {
      role,
      isAdmin,
      isSubscriber,
    }

    const cacheKey = buildResourceCacheKey({
      userId,
      isSubscriber,
      filters,
    })

    const summary = await getResourceSummary({
      user: userContext,
      subscription: subscriptionContext,
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
