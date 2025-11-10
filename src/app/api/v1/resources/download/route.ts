import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { verifyDownloadToken } from '@/lib/download-token'
import { checkRateLimit } from '@/lib/helpers/rate-limit'

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
            accessEntries: {
              where: {
                userId: payload.userId,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    const hasAccess =
      file.resource.isFree ||
      file.resource.accessEntries.length > 0 ||
      (await prisma.subscription.count({
        where: {
          userId: payload.userId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })) > 0

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const response = NextResponse.redirect(file.url, 302)
    response.headers.set('Cache-Control', 'private, no-store')

    return response
  } catch (error) {
    console.error('Erro ao entregar download:', error)
    return NextResponse.json({ error: 'Erro ao entregar download' }, { status: 500 })
  }
}
