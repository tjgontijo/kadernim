import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { PaymentService } from '@/services/billing/payment.service'
import { PixAutomaticService } from '@/services/billing/pix-automatic.service'
import { CheckoutRequestSchema } from '@/schemas/billing/payment-schemas'
import { billingLog } from '@/services/billing/logger'

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = CheckoutRequestSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Dados inválidos',
                details: parsed.error.format()
            }, { status: 400 })
        }

        const { cpfCnpj, paymentMethod, creditCard } = parsed.data

        if (paymentMethod === 'PIX') {
            const result = await PaymentService.createPixSubscription(session.user.id, cpfCnpj)

            return NextResponse.json({
                subscriptionId: result.subscription.id,
                invoiceId: result.invoice.id,
                qrCodePayload: result.qrCodePayload,
                qrCodeImage: result.qrCodeImage,
                expirationDate: result.expirationDate
            }, { status: 200 })
        }

        if (paymentMethod === 'PIX_AUTOMATIC') {
            const result = await PixAutomaticService.createAuthorization(session.user.id, cpfCnpj)

            return NextResponse.json({
                subscriptionId: result.subscription.id,
                authorizationId: result.authorizationId,
                qrCodePayload: result.qrCodePayload,
                qrCodeImage: result.qrCodeImage,
                expirationDate: result.expirationDate
            }, { status: 200 })
        }

        if (paymentMethod === 'CREDIT_CARD' && creditCard) {
            // We assume the frontend passed valid CC fields
            const result = await PaymentService.createCreditCardSubscription(
                session.user.id,
                cpfCnpj,
                {
                    holderName: creditCard.holderName!,
                    number: creditCard.number!,
                    expiryMonth: creditCard.expiryMonth!,
                    expiryYear: creditCard.expiryYear!,
                    ccv: creditCard.ccv!
                }
            )

            return NextResponse.json({
                subscriptionId: result.subscription.id,
                invoiceId: result.invoice.id,
                status: result.status // If status === 'RECEIVED' or 'CONFIRMED', we can approve instantly
            }, { status: 200 })
        }

        return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 })
    } catch (error: any) {
        billingLog('error', 'Checkout error', { error: error.message, stack: error.stack })
        return NextResponse.json({
            error: 'Erro interno ao processar pagamento. Tente novamente mais tarde.',
            details: error.message
        }, { status: 500 })
    }
}
