import { createHmac, timingSafeEqual } from 'node:crypto'
import { CheckoutStatusTokenType } from '@/lib/billing/checkout-offer'

const CHECKOUT_STATUS_TOKEN_TTL_MS = 1000 * 60 * 60 * 24

type CheckoutStatusPayload = {
  type: CheckoutStatusTokenType
  resourceId: string
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

function verifyToken(token: string, type: CheckoutStatusTokenType, resourceId: string) {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) {
      return false
    }

    const expectedSignature = sign(payload)
    if (signature.length !== expectedSignature.length) {
      return false
    }

    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return false
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as CheckoutStatusPayload

    return decoded.type === type && decoded.resourceId === resourceId && decoded.exp > Date.now()
  } catch {
    return false
  }
}

export class CheckoutStatusTokenService {
  static create(type: CheckoutStatusTokenType, resourceId: string) {
    const payload = Buffer.from(JSON.stringify({
      type,
      resourceId,
      exp: Date.now() + CHECKOUT_STATUS_TOKEN_TTL_MS,
    } satisfies CheckoutStatusPayload)).toString('base64url')

    return `${payload}.${sign(payload)}`
  }

  static createInvoiceToken(invoiceId: string) {
    return this.create('invoice', invoiceId)
  }

  static createAuthorizationToken(authorizationId: string) {
    return this.create('authorization', authorizationId)
  }

  static verifyInvoiceToken(token: string, invoiceId: string) {
    return verifyToken(token, 'invoice', invoiceId)
  }

  static verifyAuthorizationToken(token: string, authorizationId: string) {
    return verifyToken(token, 'authorization', authorizationId)
  }
}
