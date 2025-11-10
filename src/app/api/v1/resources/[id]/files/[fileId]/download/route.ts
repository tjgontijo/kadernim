import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/helpers/rate-limit'
import {
  createDownloadToken,
  DOWNLOAD_TOKEN_DEFAULT_TTL_MS,
} from '@/lib/download-token'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

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
        url: true,
        resource: {
          select: {
            id: true,
            isFree: true,
            accessEntries: {
              where: {
                userId,
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
          userId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })) > 0

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
