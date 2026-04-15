import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'
import { formatCheckoutCurrency } from '@/lib/billing/checkout-offer'
import { isValidBrazilianPhone } from '@/lib/utils/phone'
import { authDeliveryService } from '@/services/delivery'
import { AsaasClient } from '@/lib/billing/services/asaas-client'
import { billingLog } from '@/lib/billing/services/logger'

type PixQrCodeResponse = {
  payload: string
  encodedImage: string
  expirationDate: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const channel: 'email' | 'whatsapp' | 'both' = body.channel ?? 'email'

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true },
    })

    if (!invoice || invoice.userId !== session.user?.id) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.pixResendCount >= 3) {
      return NextResponse.json(
        { error: 'Limite de reenvios atingido (máximo 3)' },
        { status: 429 }
      )
    }

    if (invoice.pixLastResendAt) {
      const msSinceLast = Date.now() - invoice.pixLastResendAt.getTime()
      if (msSinceLast < 5 * 60 * 1000) {
        const waitSeconds = Math.ceil((5 * 60 * 1000 - msSinceLast) / 1000)
        return NextResponse.json(
          { error: 'Aguarde antes de reenviar', retryAfterSeconds: waitSeconds },
          { status: 429 }
        )
      }
    }

    let pixPayload = invoice.pixQrCodePayload
    let pixImage = invoice.pixQrCodeImage
    let pixExpirationDate = invoice.pixExpirationDate

    // If expired or missing, fetch new QR from Asaas
    if (!pixPayload || !pixExpirationDate || new Date() > pixExpirationDate) {
      const newQrCode = await AsaasClient.get<PixQrCodeResponse>(
        `/payments/${invoice.asaasId}/pixQrCode`
      )
      pixPayload = newQrCode.payload
      pixImage = newQrCode.encodedImage
      pixExpirationDate = new Date(newQrCode.expirationDate)

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          pixQrCodePayload: pixPayload,
          pixQrCodeImage: pixImage,
          pixExpirationDate,
        },
      })
    }

    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pix?invoiceId=${invoice.id}`
    const amountLabel = formatCheckoutCurrency(invoice.value)
    const expirationLabel = pixExpirationDate
      ? pixExpirationDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : '30 minutos'

    const channels: Array<'email' | 'whatsapp'> = []
    if (channel === 'email' || channel === 'both') {
      channels.push('email')
    }
    if ((channel === 'whatsapp' || channel === 'both') && isValidBrazilianPhone(invoice.user.phone)) {
      channels.push('whatsapp')
    }

    if (channels.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum canal disponível para reenvio' },
        { status: 400 }
      )
    }

    await authDeliveryService.send({
      email: invoice.user.email,
      type: 'pix-checkout',
      data: {
        name: invoice.user.name,
        pixPayload: pixPayload ?? '',
        pixImage: pixImage ?? undefined,
        pixExpirationDate: expirationLabel,
        invoiceId: invoice.id,
        amount: amountLabel,
        paymentUrl: checkoutUrl,
      },
      channels,
    })

    const updateData: Record<string, unknown> = {
      pixResendCount: { increment: 1 },
      pixLastResendAt: new Date(),
    }
    if (channels.includes('email')) {
      updateData.pixEmailSentAt = new Date()
    }
    if (channels.includes('whatsapp')) {
      updateData.pixWhatsappSentAt = new Date()
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: updateData,
    })

    billingLog('info', 'PIX QR Code resent', {
      invoiceId: invoice.id,
      channels,
      resendCount: invoice.pixResendCount + 1,
    })

    const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      message: 'QR Code reenviado com sucesso',
      nextRetryAt,
    })
  } catch (error: any) {
    billingLog('error', 'PIX resend failed', { error: error.message })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
