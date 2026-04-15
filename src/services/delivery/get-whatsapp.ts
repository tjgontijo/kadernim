import { buildMagicLinkWhatsappMessage, buildOtpWhatsappMessage } from '@/services/whatsapp/template/auth-otp'
import { buildPixFailureWhatsappMessage } from '@/services/whatsapp/template/pix-failure'

import { DeliveryData, DeliveryType } from './types'

export type GetWhatsappMessageParams = {
  type: DeliveryType
  name: string
  data: DeliveryData
}

export function getWhatsappMessage({
  type,
  name,
  data,
}: GetWhatsappMessageParams): string {
  switch (type) {
    case 'magic-link':
      return buildMagicLinkWhatsappMessage({
        name,
        url: data.url,
        expiresIn: data.expiresIn,
      })
    case 'pix-failure':
      return buildPixFailureWhatsappMessage({
        name,
        failureReason: data.failureReason || 'OTHER',
        retryUrl: data.retryUrl || '',
      })
    case 'otp':
    case 'email-verification':
    case 'password-reset':
      return buildOtpWhatsappMessage({
        name,
        otp: data.otp,
        expiresIn: data.expiresIn,
      })
    default:
      return `Olá ${name}! Você recebeu uma mensagem de autenticação.`
  }
}
