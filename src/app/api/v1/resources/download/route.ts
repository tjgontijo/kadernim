import { NextRequest, NextResponse } from 'next/server'

import { verifyDownloadToken } from '@/services/auth/token-service'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { resolveResourceDownloadByToken } from '@/services/resources/catalog'

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

    const downloadUrl = await resolveResourceDownloadByToken({
      userId: payload.userId,
      resourceId: payload.resourceId,
      fileId: payload.fileId,
    })

    const response = NextResponse.redirect(downloadUrl, 302)
    response.headers.set('Cache-Control', 'private, no-store')

    return response
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_FILE_NOT_FOUND') {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    if (error instanceof Error && error.message === 'RESOURCE_FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (error instanceof Error && error.message === 'RESOURCE_FILE_URL_MISSING') {
      return NextResponse.json({ error: 'URL do arquivo não encontrada' }, { status: 500 })
    }

    console.error('Erro ao entregar download:', error)
    return NextResponse.json({ error: 'Erro ao entregar download' }, { status: 500 })
  }
}
