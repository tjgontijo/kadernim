import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutos

interface CreateDownloadTokenParams {
  userId: string
  resourceId: string
  fileId: string
  ttlMs?: number
}

export interface DownloadTokenPayload {
  userId: string
  resourceId: string
  fileId: string
  expiresAt: number
  nonce: string
}

function getSecret() {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET
  if (!secret) {
    throw new Error('DOWNLOAD_TOKEN_SECRET não configurada')
  }
  return secret
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode<T = unknown>(value: string): T {
  const buffer = Buffer.from(value, 'base64url')
  return JSON.parse(buffer.toString('utf8')) as T
}

export function createDownloadToken({
  userId,
  resourceId,
  fileId,
  ttlMs = DEFAULT_TTL_MS,
}: CreateDownloadTokenParams) {
  const payload: DownloadTokenPayload = {
    userId,
    resourceId,
    fileId,
    expiresAt: Date.now() + ttlMs,
    nonce: randomBytes(8).toString('hex'),
  }

  const serialized = JSON.stringify(payload)
  const payloadSegment = base64UrlEncode(serialized)
  const secret = getSecret()
  const signature = createHmac('sha256', secret)
    .update(payloadSegment)
    .digest()
  const signatureSegment = base64UrlEncode(signature)

  return {
    token: `${payloadSegment}.${signatureSegment}`,
    expiresAt: payload.expiresAt,
  }
}

export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  const [payloadSegment, signatureSegment] = token.split('.')
  if (!payloadSegment || !signatureSegment) {
    return null
  }

  const secret = getSecret()
  const expectedSignature = createHmac('sha256', secret)
    .update(payloadSegment)
    .digest()
  const providedSignature = Buffer.from(signatureSegment, 'base64url')

  if (expectedSignature.length !== providedSignature.length) {
    return null
  }

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null
  }

  const payload = base64UrlDecode<DownloadTokenPayload>(payloadSegment)
  if (!payload || typeof payload.expiresAt !== 'number') {
    return null
  }

  if (payload.expiresAt <= Date.now()) {
    return null
  }

  return payload
}

export const DOWNLOAD_TOKEN_DEFAULT_TTL_MS = DEFAULT_TTL_MS
