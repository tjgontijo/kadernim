import { NextRequest, NextResponse } from 'next/server'
import { CheckoutStatusTokenService } from '@/lib/billing/services/checkout-status-token.service'
import { PaymentService } from '@/lib/billing/services/payment.service'
import { auth } from '@/server/auth/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await params
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    const session = await auth.api.getSession({ headers: request.headers })
    const invoice = session?.user
      ? await PaymentService.getInvoiceStatusForUser(invoiceId, session.user.id)
      : await getGuestInvoiceStatus(request, invoiceId)

    return NextResponse.json({ id: invoice.asaasId, status: invoice.status })
  } catch (error: any) {
    if (error.message === 'Invoice not found') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

async function getGuestInvoiceStatus(request: NextRequest, invoiceId: string) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || !CheckoutStatusTokenService.verifyInvoiceToken(token, invoiceId)) {
    throw new Error('Unauthorized')
  }

  return PaymentService.getInvoiceStatusById(invoiceId)
}
