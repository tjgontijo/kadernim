import { render } from '@react-email/render'
import MagicLinkEmail from '@/services/mail/templates/MagicLinkEmail'

interface RenderMagicLinkEmailParams {
  name: string
  magicLink: string
  expiresIn?: number
}

export async function renderMagicLinkEmail({
  name,
  magicLink,
  expiresIn = 20,
}: RenderMagicLinkEmailParams): Promise<string> {
  // Renderizar template React Email
  const htmlBody = await render(
    MagicLinkEmail({
      name,
      magicLink,
      expiresIn,
    })
  )
  
  return htmlBody
}
