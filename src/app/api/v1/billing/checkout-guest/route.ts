import { NextRequest, NextResponse } from 'next/server'
import { GuestCheckoutRequestSchema } from '@/lib/billing/schemas'
import { CheckoutCustomerService } from '@/lib/billing/services/checkout-customer.service'
import { CheckoutService } from '@/lib/billing/services/checkout.service'
import { CheckoutAuthTokenService } from '@/lib/billing/services/checkout-auth-token.service'
import { billingLog } from '@/lib/billing/services/logger'
import { checkDistributedRateLimit } from '@/server/utils/rate-limit'

function getRequestIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? undefined
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request) ?? 'unknown'
    const ipLimit = await checkDistributedRateLimit(`checkout-guest:ip:${ip}`, { windowMs: 60_000, limit: 6 })
    if (!ipLimit.allowed) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em instantes.' }, {
        status: 429,
        headers: { 'Retry-After': String(ipLimit.retryAfter) },
      })
    }

    const payload = await request.json()
    const parsed = GuestCheckoutRequestSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }
    const email = parsed.data.email.trim().toLowerCase()
    const emailLimit = await checkDistributedRateLimit(`checkout-guest:email:${email}`, { windowMs: 60_000, limit: 4 })
    if (!emailLimit.allowed) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em instantes.' }, {
        status: 429,
        headers: { 'Retry-After': String(emailLimit.retryAfter) },
      })
    }

    const user = await CheckoutCustomerService.resolveGuestCustomer(parsed.data)
    const result = await CheckoutService.createCheckout(user.id, parsed.data, {
      remoteIp: getRequestIp(request),
    })

    const checkoutAuthToken = 'status' in result && ['RECEIVED', 'CONFIRMED', 'ACTIVE'].includes(result.status ?? '')
      ? CheckoutAuthTokenService.create(user.id, user.email)
      : undefined

    return NextResponse.json({
      ...result,
      checkoutAuthToken,
    })
  } catch (error: any) {
    const status = error.message === 'Nome obrigatório para novo cadastro' ? 400 : 500

    billingLog('error', 'Guest checkout error', { error: error.message })
    return NextResponse.json({
      error: status === 400 ? error.message : 'Erro ao processar pagamento. Tente novamente.',
    }, { status })
  }
}
