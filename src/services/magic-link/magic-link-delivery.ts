import { prisma } from '@/lib/prisma'
import { nodemailerProvider } from '@/services/mail/nodemailer'
import { sendTextMessage } from '@/services/whatsapp/uazapi/send-message'

interface DeliverMagicLinkParams {
  email: string
  url: string
}

interface DeliverMagicLinkResult {
  success: boolean
  channel: 'whatsapp' | 'email' | 'none'
  error?: string
}

export async function deliverMagicLink({ email, url }: DeliverMagicLinkParams): Promise<DeliverMagicLinkResult> {
  try {
    console.log('[magic-link-delivery] Iniciando entrega para email:', email)
    
    const user = await prisma.user.findUnique({
      where: { email },
      select:{
        name: true,
        whatsapp: true,
      }
    })

    console.log('[magic-link-delivery] Usuário encontrado:', { email, hasWhatsapp: !!user?.whatsapp })

    if (!user) {
      console.error('[magic-link-delivery] Usuário não encontrado:', email)
      return {
        success: false,
        channel: 'none',
        error: 'user_not_found'
      }
    }

    let whatsappDelivered = false
    let emailDelivered = false

    if (user.whatsapp) {
      try {
        // user.whatsapp já vem normalizado do banco (ex: 5561982482100)
        console.log('[magic-link-delivery] Enviando WhatsApp para:', user.whatsapp)
        
        const message = `Olá ${user.name ?? ''}! 🎉\n\n` +
          `🔐 *Acesse sua conta Kadernim:*\n\n${url}\n\n` +
          `⏰ Este link é válido por 20 minutos.\n\n` +
          `_Não compartilhe este link com ninguém._`

        const result = await sendTextMessage({
          phone: user.whatsapp,
          message
        })

        console.log('[magic-link-delivery] Resultado WhatsApp:', result)

        if (!result.status) {
          throw new Error(result.error || 'WhatsApp send failed')
        }

        whatsappDelivered = true
        console.log('[magic-link-delivery] WhatsApp enviado com sucesso')
      } catch (whatsappError) {
        console.error('[magic-link-delivery] Erro ao enviar via WhatsApp:', whatsappError)
      }
    }

    const subject = 'Kadernim - Acesse sua conta'
    const textBody = `Olá ${user.name ?? ''}!\n\nUse o link a seguir para acessar sua conta: ${url}\n\nEste link expira em 20 minutos. Não compartilhe com ninguém.`
    const htmlBody = `<!doctype html><html><body style="font-family: Arial, sans-serif; color: #111;">
      <p>Olá ${user.name ?? ''}! 🎉</p>
      <p><strong>🔐 Acesse sua conta Kadernim:</strong></p>
      <p><a href="${url}" style="color:#2563eb;">${url}</a></p>
      <p>⏰ Este link é válido por 20 minutos.</p>
      <p><em>Não compartilhe este link com ninguém.</em></p>
    </body></html>`

    console.log('[magic-link-delivery] Enviando e-mail para:', email)
    
    const emailResult = await nodemailerProvider.send({
      to: email,
      subject,
      text: textBody,
      html: htmlBody
    })

    console.log('[magic-link-delivery] Resultado e-mail:', emailResult)

    if (emailResult.success) {
      emailDelivered = true
      console.log('[magic-link-delivery] E-mail enviado com sucesso')
    } else {
      console.error('[magic-link-delivery] Erro ao enviar e-mail:', emailResult.error)
    }

    console.log('[magic-link-delivery] Status final - WhatsApp:', whatsappDelivered, 'Email:', emailDelivered)

    if (whatsappDelivered || emailDelivered) {
      const finalResult = {
        success: true,
        channel: whatsappDelivered ? 'whatsapp' as const : 'email' as const
      }
      console.log('[magic-link-delivery] Entrega bem-sucedida:', finalResult)
      return finalResult
    }

    const failureResult = {
      success: false,
      channel: 'none' as const,
      error: 'delivery_failed'
    }
    console.error('[magic-link-delivery] Entrega falhou:', failureResult)
    return failureResult
  } catch (error) {
    console.error('[magic-link-delivery] Erro no serviço de entrega:', error)
    console.error('[magic-link-delivery] Stack trace:', error instanceof Error ? error.stack : 'N/A')
    return {
      success: false,
      channel: 'none',
      error: 'internal_error'
    }
  }
}
