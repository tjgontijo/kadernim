export type WhatsappTemplateParams = {
  name: string
  url?: string
  otp?: string
  expiresIn?: number
}

export function buildMagicLinkWhatsappMessage({
  name,
  url,
  expiresIn = 20,
}: WhatsappTemplateParams): string {
  if (!url) {
    throw new Error('URL é obrigatória para template de WhatsApp (magic link)')
  }

  return (
    `Olá ${name}! 🎉\n\n` +
    `🔐 *Acesse sua conta Kadernim:*\n\n${url}\n\n` +
    `⏰ Este link é válido por ${expiresIn} minutos.\n\n` +
    `_Não compartilhe este link com ninguém._`
  )
}

export function buildOtpWhatsappMessage({
  name,
  otp,
  expiresIn = 5,
}: WhatsappTemplateParams): string {
  if (!otp) {
    throw new Error('OTP é obrigatório para template de WhatsApp (código)')
  }

  return (
    `Olá ${name}! 🎉\n\n` +
    `🔐 *Seu código de acesso:*\n\n*${otp}*\n\n` +
    `⏰ Este código é válido por ${expiresIn} minutos.\n\n` +
    `_Não compartilhe este código com ninguém._`
  )
}
