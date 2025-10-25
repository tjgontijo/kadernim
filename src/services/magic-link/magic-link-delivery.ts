import { authDeliveryService } from '@/services/delivery'

interface DeliverMagicLinkParams {
  email: string
  url: string
}

interface DeliverMagicLinkResult {
  success: boolean
  channel: 'whatsapp' | 'email' | 'none'
  error?: string
}

/**
 * Wrapper para manter compatibilidade com código existente
 * Internamente usa AuthDeliveryService
 */
export async function deliverMagicLink({ email, url }: DeliverMagicLinkParams): Promise<DeliverMagicLinkResult> {
  console.log('[magic-link-delivery] Iniciando entrega para email:', email)
  
  const result = await authDeliveryService.send({
    email,
    type: 'magic-link',
    data: {
      url,
      expiresIn: 20,
    },
    channels: ['email', 'whatsapp'],
  })

  console.log('[magic-link-delivery] Resultado:', result)
  
  return result
}
