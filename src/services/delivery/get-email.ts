import { generateMagicLinkEmail } from '@/services/mail/templates/magic-link-email'
import { generateOtpEmail } from '@/services/mail/templates/otp-email'
import { generatePixCheckoutEmail } from '@/services/mail/templates/pix-checkout-email'
import { generatePixFailureEmail } from '@/services/mail/templates/pix-failure-email'

import { DeliveryData, DeliveryType, EmailTemplate } from './types'

export type GetEmailTemplateParams = {
  type: DeliveryType
  name: string
  data: DeliveryData
}

export async function getEmailTemplate({
  type,
  name,
  data,
}: GetEmailTemplateParams): Promise<EmailTemplate> {
  if (type === 'magic-link') {
    const url = data.url
    const expiresIn = data.expiresIn ?? 20

    if (!url) {
      throw new Error('URL é obrigatória para envio de magic link')
    }

    return generateMagicLinkEmail({ name, magicLink: url, expiresIn })
  }

  if (type === 'pix-failure') {
    const failureReason = data.failureReason || 'OTHER'
    const retryUrl = data.retryUrl || ''

    return generatePixFailureEmail({
      name,
      failureReason,
      retryUrl,
      nextRetryDate: '3 dias',
    })
  }

  if (type === 'pix-checkout') {
    const pixPayload = data.pixPayload || ''
    const pixImage = data.pixImage
    const expirationDate = data.pixExpirationDate || ''
    const paymentUrl = data.paymentUrl || ''
    const amount = data.amount || ''

    return generatePixCheckoutEmail({
      name,
      amount,
      pixPayload,
      pixImage,
      expirationDate,
      paymentUrl,
    })
  }

  const otp = data.otp
  const expiresIn = data.expiresIn ?? 5

  if (!otp) {
    throw new Error('OTP é obrigatório para envio deste tipo de mensagem')
  }

  const otpSubjectMap: Record<string, string> = {
    otp: '🔐 Seu código de acesso - Kadernim',
    'email-verification': '🔐 Código de verificação - Kadernim',
    'password-reset': '🔐 Código para redefinir senha - Kadernim',
  }

  const subject = otpSubjectMap[type] ?? '🔐 Código de verificação - Kadernim'

  const template = await generateOtpEmail({ name, otp, expiresIn })

  return {
    ...template,
    subject,
  }
}
