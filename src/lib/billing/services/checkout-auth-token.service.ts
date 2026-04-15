import { createHmac, timingSafeEqual } from 'node:crypto'

const CHECKOUT_AUTH_TOKEN_TTL_MS = 1000 * 60 * 10 // 10 minutes

type CheckoutAuthPayload = {
  userId: string
  email: string
  exp: number
}

function getSecret() {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not configured')
  }
  return secret
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export class CheckoutAuthTokenService {
  static create(userId: string, email: string) {
    const payload = Buffer.from(JSON.stringify({
      userId,
      email,
      exp: Date.now() + CHECKOUT_AUTH_TOKEN_TTL_MS,
    } satisfies CheckoutAuthPayload)).toString('base64url')

    return `${payload}.${sign(payload)}`
  }

  static verify(token: string): { userId: string; email: string } | null {
    try {
      const [payload, signature] = token.split('.')
      if (!payload || !signature) {
        return null
      }

      const expectedSignature = sign(payload)
      if (signature.length !== expectedSignature.length) {
        return null
      }

      if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null
      }

      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as CheckoutAuthPayload

      if (decoded.exp <= Date.now()) {
        return null
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      }
    } catch {
      return null
    }
  }
}
