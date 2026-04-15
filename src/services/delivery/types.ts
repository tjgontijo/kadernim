export type DeliveryType = 'magic-link' | 'otp' | 'password-reset' | 'email-verification' | 'pix-failure'
export type DeliveryChannel = 'email' | 'whatsapp'

export interface DeliveryData {
  url?: string           // para magic-link
  otp?: string          // para otp
  name?: string
  expiresIn?: number
  failureReason?: string      // para pix-failure
  failureMessage?: string     // para pix-failure
  retryUrl?: string          // para pix-failure
  subscriptionId?: string    // para pix-failure
}

export interface AuthDeliveryPayload {
  email: string
  type: DeliveryType
  data: DeliveryData
  channels?: DeliveryChannel[]
}

export interface AuthDeliveryResult {
  success: boolean
  channel: DeliveryChannel | 'none'
  error?: string
}

export interface EmailTemplate {
  subject: string
  text: string
  html: string
}
