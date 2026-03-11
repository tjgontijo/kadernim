import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

import { auth } from '@/server/auth/auth'
import { ResourceFilterSchema } from '@/schemas/resources/resource-schemas'
import {
  buildResourceCacheKey,
  buildResourceCacheTag,
} from '@/server/utils/cache'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { getResourceAccessContext, getResourceList } from '@/services/resources/catalog'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    const role = session?.user?.role

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
    const access = await getResourceAccessContext(userId, role ?? null)
    const hasFullAccess = access.user.isAdmin || access.subscription.hasActiveSubscription

    const cacheKey = buildResourceCacheKey({
      userId,
      isSubscriber: hasFullAccess,
      filters: { q, educationLevel, subject, tab, page, limit },
    })

    const fetchResources = unstable_cache(
      async () => {
        const list = await getResourceList({
          user: access.user,
          subscription: access.subscription,
          filters: {
            page,
            limit,
            q,
            educationLevel,
            grade: undefined,
            subject,
            tab,
          },
        })

        return {
          data: list.items,
          pagination: list.pagination,
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
