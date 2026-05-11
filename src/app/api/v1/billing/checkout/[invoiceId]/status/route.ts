import { NextRequest, NextResponse } from 'next/server'
import { CheckoutStatusTokenService } from '@/lib/billing/services/checkout-status-token.service'
import { CheckoutAuthTokenService } from '@/lib/billing/services/checkout-auth-token.service'
import { PaymentService } from '@/lib/billing/services/payment.service'
import { prisma } from '@/lib/db'
import { auth } from '@/server/auth/auth'

const CONFIRMED_STATUSES = ['RECEIVED', 'CONFIRMED', 'ACTIVE']

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

    if (session?.user) {
      const invoice = await PaymentService.getInvoiceStatusForUser(invoiceId, session.user.id)
      return NextResponse.json({ id: invoice.asaasId, status: invoice.status })
    }

    const invoice = await getGuestInvoiceStatus(request, invoiceId)
    const checkoutAuthToken = CONFIRMED_STATUSES.includes(invoice.status)
      ? CheckoutAuthTokenService.create(invoice.userId, invoice.user.email)
      : undefined

    return NextResponse.json({
      id: invoice.asaasId,
      status: invoice.status,
      ...(checkoutAuthToken ? { checkoutAuthToken } : {}),
    })
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

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      status: true,
      asaasId: true,
      userId: true,
      user: { select: { email: true } },
    },
  })

  if (!invoice) throw new Error('Invoice not found')
  return invoice
}
