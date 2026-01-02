import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

import { auth } from '@/server/auth/auth'
import { prisma } from '@/lib/db'
import { ResourceFilterSchema } from '@/lib/schemas/resource'
import { buildResourceCacheTag } from '@/server/utils/cache'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { getResourceCounts } from '@/services/resources/catalog/count-service'
import type { SubscriptionContext, UserAccessContext } from '@/services/auth/access-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    const role = session?.user?.role ?? null
    const isAdmin = role === 'admin'

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
    const filters = { q, educationLevel, subject }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    })

    const userContext: UserAccessContext = {
      userId,
      isAdmin,
    }

    const subscriptionContext: SubscriptionContext = {
      hasActiveSubscription: Boolean(activeSubscription),
    }

    const cacheKey = [
      'resources-count',
      userId,
      `tab:${tab}`,
      q ?? '',
      educationLevel ?? '',
      subject ?? '',
      `admin:${isAdmin ? 1 : 0}`,
      `sub:${subscriptionContext.hasActiveSubscription ? 1 : 0}`,
    ]

    const fetchCount = unstable_cache(
      async () => {
        const counts = await getResourceCounts({
          user: userContext,
          subscription: subscriptionContext,
          filters,
        })

        return counts
      },
      cacheKey,
      {
        revalidate: 30,
        tags: [buildResourceCacheTag(userId)],
      }
    )

    const counts = await fetchCount()

    const tabCount =
      tab === 'mine' ? counts.mine : tab === 'free' ? counts.free : counts.all

    return NextResponse.json({ data: { tab, count: tabCount } })
  } catch (error) {
    console.error('Erro ao contar recursos:', error)
    return NextResponse.json({ error: 'Erro ao contar recursos' }, { status: 500 })
  }
}
