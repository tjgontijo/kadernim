import { NextRequest, NextResponse } from 'next/server'
import { getResourceDownloadGrant } from '@/lib/resources/services/catalog'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
  createDownloadToken,
  DOWNLOAD_TOKEN_DEFAULT_TTL_MS,
} from '@/services/auth/token-service'
import { logResourceDownload } from '@/lib/resources/services/catalog/interaction-service'
import { authorizeResourceListRequest } from '../../../route-support'

export async function createResourceFileDownloadPayload(
  request: NextRequest,
  params: Promise<{ id: string; fileId: string }>
) {
  const authResult = await authorizeResourceListRequest(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id: resourceId, fileId } = await params
  if (!resourceId || !fileId) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const rl = checkRateLimit(`resource-download:${authResult.userId}:${resourceId}:${fileId}`, {
    windowMs: 60_000,
    limit: 30,
  })
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
    userId: authResult.userId,
    role: authResult.role,
    resourceId,
    fileId,
  })

  // Log the download interaction
  await logResourceDownload(authResult.userId, resourceId)

  const { token, expiresAt } = createDownloadToken({
    userId: authResult.userId,
    resourceId,
    fileId: file.id,
    ttlMs: DOWNLOAD_TOKEN_DEFAULT_TTL_MS,
  })

  return {
    file,
    expiresAt,
    downloadUrl: `/api/v1/resources/download?token=${token}`,
  }
}

export function serializeResourceFileDownload(input: {
  file: { id: string; name: string }
  downloadUrl: string
  expiresAt: number
}) {
  return NextResponse.json({
    data: {
      id: input.file.id,
      name: input.file.name,
      downloadUrl: input.downloadUrl,
    },
    meta: {
      expiresAt: new Date(input.expiresAt).toISOString(),
    },
  })
}

export function resourceFileDownloadError(error: unknown) {
  if (error instanceof Error && error.message === 'RESOURCE_FILE_NOT_FOUND') {
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
  }

  if (error instanceof Error && error.message === 'RESOURCE_FORBIDDEN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  console.error('Erro ao gerar link de download:', error)
  return NextResponse.json({ error: 'Erro ao gerar link de download' }, { status: 500 })
}
