import { NextRequest, NextResponse } from 'next/server'
import { CheckoutRequestSchema } from '@/lib/billing/schemas'
import { CheckoutService } from '@/lib/billing/services/checkout.service'
import { billingLog } from '@/lib/billing/services/logger'
import { auth } from '@/server/auth/auth'
import { checkDistributedRateLimit } from '@/server/utils/rate-limit'

function getRequestIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? undefined
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request) ?? 'unknown'
    const rl = await checkDistributedRateLimit(`checkout:${ip}`, { windowMs: 60_000, limit: 8 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em instantes.' }, {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfter) },
      })
    }

    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = CheckoutRequestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const result = await CheckoutService.createCheckout(session.user.id, parsed.data, {
      remoteIp: getRequestIp(request),
    })

    return NextResponse.json(result)
  } catch (error: any) {
    billingLog('error', 'Checkout error', { error: error.message, stack: error.stack })
    return NextResponse.json({
      error: 'Erro interno ao processar pagamento. Tente novamente mais tarde.',
    }, { status: 500 })
  }
}
