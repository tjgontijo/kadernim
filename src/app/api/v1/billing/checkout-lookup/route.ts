import { NextRequest, NextResponse } from 'next/server'
import { CheckoutLookupQuerySchema } from '@/schemas/billing/payment-schemas'
import { CheckoutCustomerService } from '@/services/billing/checkout-customer.service'

export async function GET(request: NextRequest) {
  const parsed = CheckoutLookupQuerySchema.safeParse({
    email: request.nextUrl.searchParams.get('email')?.toLowerCase().trim(),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
  }

  const result = await CheckoutCustomerService.lookupByEmail(parsed.data.email)
  return NextResponse.json(result)
}
