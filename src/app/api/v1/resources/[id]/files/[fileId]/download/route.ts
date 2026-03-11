import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/server/auth/auth'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
  createDownloadToken,
  DOWNLOAD_TOKEN_DEFAULT_TTL_MS,
} from '@/services/auth/token-service'
import { getResourceDownloadGrant } from '@/services/resources/catalog'

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

    const file = await getResourceDownloadGrant({
      userId,
      role,
      resourceId,
      fileId,
    })

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
    if (error instanceof Error && error.message === 'RESOURCE_FILE_NOT_FOUND') {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    if (error instanceof Error && error.message === 'RESOURCE_FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Erro ao gerar link de download:', error)
    return NextResponse.json({ error: 'Erro ao gerar link de download' }, { status: 500 })
  }
}
