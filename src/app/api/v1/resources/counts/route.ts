import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

import { auth } from '@/server/auth/auth'
import { ResourceFilterSchema } from '@/schemas/resources/resource-schemas'
import { buildResourceCacheTag } from '@/server/utils/cache'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { getResourceAccessContext, getResourceCounts } from '@/services/resources/catalog'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    const role = session?.user?.role ?? null

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
    const access = await getResourceAccessContext(userId, role)

    const cacheKey = [
      'resources-count',
      userId,
      `tab:${tab}`,
      q ?? '',
      educationLevel ?? '',
      subject ?? '',
      `admin:${access.user.isAdmin ? 1 : 0}`,
      `sub:${access.subscription.hasActiveSubscription ? 1 : 0}`,
    ]

    const fetchCount = unstable_cache(
      async () => {
        const counts = await getResourceCounts({
          user: access.user,
          subscription: access.subscription,
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
