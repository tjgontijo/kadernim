import { prisma } from '@/lib/prisma'
import { resendProvider } from '@/services/mail/resend'
import { sendTextMessage } from '@/services/whatsapp/uazapi/send-message'
import { renderMagicLinkEmail } from './magic-link-renderer'

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

    console.log('[magic-link-delivery] Usuário encontrado:', { email, hasWhatsapp: !!user?.whatsapp, name: user?.name })

    if (!user) {
      console.error('[magic-link-delivery] Usuário não encontrado:', email)
      return {
        success: false,
        channel: 'none',
        error: 'user_not_found'
      }
    }
    
    console.log('[magic-link-delivery] Dados do usuário completos:', { name: user.name, email, whatsapp: user.whatsapp })

    let emailDelivered = false

    const subject = '🔐 Seu link de acesso - Kadernim'
    const textBody = `Olá ${user.name ?? ''}!\n\nUse o link a seguir para acessar sua conta: ${url}\n\nEste link expira em 20 minutos. Não compartilhe com ninguém.\n\nPrecisa de ajuda?\nWhatsApp: +55 11 4863-5262\nE-mail: contato@kadernim.com.br\nEndereço: Brasília - DF, Brasil`
    
    console.log('[magic-link-delivery] Nome do usuário:', user.name)
    
    // Renderizar template React Email
    const htmlBody = await renderMagicLinkEmail({
      name: user.name || 'Usuário',
      magicLink: url,
      expiresIn: 20,
    })

    console.log('[magic-link-delivery] Enviando e-mail para:', email)
    
    const emailResult = await resendProvider.send({
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

    if (user.whatsapp) {
      const whatsappNumber = user.whatsapp
      console.log('[magic-link-delivery] Agendando envio de WhatsApp para 15 segundos')

      void (async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 15000))
          console.log('[magic-link-delivery] Enviando WhatsApp para:', whatsappNumber)

          const message = `Olá ${user.name ?? ''}! 🎉\n\n` +
            `🔐 *Acesse sua conta Kadernim:*\n\n${url}\n\n` +
            `⏰ Este link é válido por 20 minutos.\n\n` +
            `_Não compartilhe este link com ninguém._`

          const result = await sendTextMessage({
            phone: whatsappNumber,
            message
          })

          console.log('[magic-link-delivery] Resultado WhatsApp:', result)

          if (!result.status) {
            throw new Error(result.error || 'WhatsApp send failed')
          }

          console.log('[magic-link-delivery] WhatsApp enviado com sucesso')
        } catch (whatsappError) {
          console.error('[magic-link-delivery] Erro ao enviar via WhatsApp:', whatsappError)
        }
      })()
    }

    console.log('[magic-link-delivery] Status final - Email:', emailDelivered)

    if (emailDelivered) {
      const finalResult = {
        success: true,
        channel: 'email' as const
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
