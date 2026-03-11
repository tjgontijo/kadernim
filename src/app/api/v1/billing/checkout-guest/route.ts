import { NextRequest, NextResponse } from 'next/server'
import { GuestCheckoutRequestSchema } from '@/schemas/billing/payment-schemas'
import { CheckoutCustomerService } from '@/services/billing/checkout-customer.service'
import { CheckoutService } from '@/services/billing/checkout.service'
import { billingLog } from '@/services/billing/logger'

function getRequestIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? undefined
}

export async function POST(request: NextRequest) {
  try {
    const parsed = GuestCheckoutRequestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.format() }, { status: 400 })
    }

    const user = await CheckoutCustomerService.resolveGuestCustomer(parsed.data)
    const result = await CheckoutService.createCheckout(user.id, parsed.data, {
      remoteIp: getRequestIp(request),
    })

    return NextResponse.json(result)
  } catch (error: any) {
    const status = error.message === 'Nome obrigatório para novo cadastro' ? 400 : 500

    billingLog('error', 'Guest checkout error', { error: error.message })
    return NextResponse.json({
      error: status === 400 ? error.message : 'Erro ao processar pagamento. Tente novamente.',
      details: error.message,
    }, { status })
  }
}
