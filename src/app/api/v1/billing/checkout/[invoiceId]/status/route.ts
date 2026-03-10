import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { PaymentService } from '@/services/billing/payment.service'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ invoiceId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { invoiceId } = await params

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
        }

        const invoice = await PaymentService.getInvoiceStatus(invoiceId, session.user.id)

        return NextResponse.json({
            id: invoice.asaasId,
            status: invoice.status,
        }, { status: 200 })

    } catch (error: any) {
        if (error.message === 'Invoice not found') {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
