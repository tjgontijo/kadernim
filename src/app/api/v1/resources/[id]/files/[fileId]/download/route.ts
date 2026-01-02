import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/server/auth/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
  createDownloadToken,
  DOWNLOAD_TOKEN_DEFAULT_TTL_MS,
} from '@/services/auth/token-service'
import {
  computeHasAccessForResource,
  type SubscriptionContext,
  type UserAccessContext,
} from '@/services/auth/access-service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    const role = session?.user?.role ?? null

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resourceId, fileId } = await ctx.params

    if (!resourceId || !fileId) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    const rateLimitKey = `resource-download:${userId}:${resourceId}:${fileId}`
    const rl = checkRateLimit(rateLimitKey, { windowMs: 60_000, limit: 30 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfter),
          },
        }
      )
    }

    const file = await prisma.resourceFile.findFirst({
      where: {
        id: fileId,
        resourceId,
      },
      select: {
        id: true,
        name: true,
        cloudinaryPublicId: true,
        resource: {
          select: {
            id: true,
            isFree: true,
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

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
      isAdmin: role === 'admin',
    }

    const subscriptionContext: SubscriptionContext = {
      hasActiveSubscription: Boolean(activeSubscription),
    }

    const hasAccess = await computeHasAccessForResource(userContext, subscriptionContext, {
      resourceId,
      isFree: file.resource.isFree,
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { token, expiresAt } = createDownloadToken({
      userId,
      resourceId,
      fileId: file.id,
      ttlMs: DOWNLOAD_TOKEN_DEFAULT_TTL_MS,
    })

    const downloadUrl = `/api/v1/resources/download?token=${token}`

    console.info('[download] token emitido', {
      userId,
      resourceId,
      fileId: file.id,
      expiresAt,
    })

    return NextResponse.json({
      data: {
        id: file.id,
        name: file.name,
        downloadUrl,
      },
      meta: {
        expiresAt: new Date(expiresAt).toISOString(),
      },
    })
  } catch (error) {
    console.error('Erro ao gerar link de download:', error)
    return NextResponse.json({ error: 'Erro ao gerar link de download' }, { status: 500 })
  }
}
