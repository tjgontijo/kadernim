import { unstable_cache } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import {
  ResourceFilter,
  ResourceFilterSchema,
} from '@/schemas/resources/resource-schemas'
import {
  buildResourceCacheKey,
  buildResourceCacheTag,
} from '@/server/utils/cache'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
  getResourceAccessContext,
  getResourceCounts,
  getResourceMetaForUser,
  getResourceList,
  getResourceSummary,
} from '@/services/resources/catalog'

export async function authorizeResourceListRequest(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id
  const role = session?.user?.role ?? null

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

  return { userId, role }
}

export function parseResourceListFilters(request: NextRequest) {
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

  return parsed.data
}

export async function fetchCachedResourceList(input: {
  userId: string
  role: string | null
  filters: ResourceFilter
}) {
  const access = await getResourceAccessContext(input.userId, input.role)
  const hasFullAccess = access.user.isAdmin || access.subscription.hasActiveSubscription
  const cacheKey = buildResourceCacheKey({
    userId: input.userId,
    isSubscriber: hasFullAccess,
    filters: input.filters,
  })

  return unstable_cache(
    async () => {
      const list = await getResourceList({
        user: access.user,
        subscription: access.subscription,
        filters: {
          ...input.filters,
          grade: undefined,
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
      tags: [buildResourceCacheTag(input.userId)],
    }
  )()
}

export function resourceListServerError(error: unknown) {
  console.error('Erro ao buscar recursos:', error)
  return NextResponse.json({ error: 'Erro ao buscar recursos' }, { status: 500 })
}

export async function fetchCachedResourceCounts(input: {
  userId: string
  role: string | null
  filters: Pick<ResourceFilter, 'tab' | 'q' | 'educationLevel' | 'subject'>
}) {
  const access = await getResourceAccessContext(input.userId, input.role)
  const cacheKey = [
    'resources-count',
    input.userId,
    `tab:${input.filters.tab}`,
    input.filters.q ?? '',
    input.filters.educationLevel ?? '',
    input.filters.subject ?? '',
    `admin:${access.user.isAdmin ? 1 : 0}`,
    `sub:${access.subscription.hasActiveSubscription ? 1 : 0}`,
  ]

  return unstable_cache(
    async () =>
      getResourceCounts({
        user: access.user,
        subscription: access.subscription,
        filters: {
          q: input.filters.q,
          educationLevel: input.filters.educationLevel,
          subject: input.filters.subject,
        },
      }),
    cacheKey,
    {
      revalidate: 30,
      tags: [buildResourceCacheTag(input.userId)],
    }
  )()
}

export async function fetchResourceSummary(input: {
  userId: string
  role: string | null
  filters: ResourceFilter
}) {
  const access = await getResourceAccessContext(input.userId, input.role)
  const userMeta = await getResourceMetaForUser(input.userId, input.role)
  const cacheKey = buildResourceCacheKey({
    userId: input.userId,
    isSubscriber: access.subscription.hasActiveSubscription,
    filters: input.filters,
  })
  const summary = await getResourceSummary({
    user: access.user,
    subscription: access.subscription,
    filters: input.filters,
    userMeta,
  })

  return {
    summary,
    cacheKey,
  }
}

export function resourceSummaryHeaders(cacheKey: string[]) {
  return {
    'Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
    'CDN-Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
    Vary: 'Authorization, Cookie',
    'X-Resource-Cache-Key': cacheKey.join(':'),
  }
}

export function resourceCountsServerError(error: unknown) {
  console.error('Erro ao contar recursos:', error)
  return NextResponse.json({ error: 'Erro ao contar recursos' }, { status: 500 })
}

export function resourceSummaryServerError(error: unknown) {
  console.error('Erro ao buscar resumo de recursos:', error)
  return NextResponse.json({ error: 'Erro ao buscar recursos' }, { status: 500 })
}
