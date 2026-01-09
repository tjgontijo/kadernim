import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { verifyDownloadToken } from '@/services/auth/token-service'
import { checkRateLimit } from '@/server/utils/rate-limit'

import { isStaff } from '@/lib/auth/roles'
import {
  computeHasAccessForResource,
  type SubscriptionContext,
  type UserAccessContext,
} from '@/services/auth/access-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token ausente' }, { status: 400 })
    }

    const payload = verifyDownloadToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
    }

    const rateLimitKey = `resource-download-token:${payload.userId}:${payload.fileId}`
    const rl = checkRateLimit(rateLimitKey, { windowMs: 60_000, limit: 60 })

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
        id: payload.fileId,
        resourceId: payload.resourceId,
      },
      select: {
        id: true,
        url: true,
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: payload.userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    })

    const userContext: UserAccessContext = {
      userId: payload.userId,
      isAdmin: isStaff(user?.role as any),
    }

    const subscriptionContext: SubscriptionContext = {
      hasActiveSubscription: Boolean(subscription),
    }

    const hasAccess = await computeHasAccessForResource(userContext, subscriptionContext, {
      resourceId: file.resource.id,
      isFree: file.resource.isFree,
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!file.url) {
      return NextResponse.json({ error: 'URL do arquivo não encontrada' }, { status: 500 })
    }

    const response = NextResponse.redirect(file.url, 302)
    response.headers.set('Cache-Control', 'private, no-store')

    return response
  } catch (error) {
    console.error('Erro ao entregar download:', error)
    return NextResponse.json({ error: 'Erro ao entregar download' }, { status: 500 })
  }
}
