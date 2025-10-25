import { render } from '@react-email/render'
import { prisma } from '@/lib/prisma'
import { resendProvider } from '@/services/mail/resend'
import { sendTextMessage } from '@/services/whatsapp/uazapi/send-message'
import MagicLinkEmail from '@/services/mail/templates/MagicLinkEmail'
import OtpEmail from '@/services/mail/templates/OtpEmail'
import {
  AuthDeliveryPayload,
  AuthDeliveryResult,
  DeliveryType,
  DeliveryData,
  EmailTemplate,
} from './types'

class AuthDeliveryService {
  /**
   * Envia mensagem de autenticação via email e/ou WhatsApp
   * Email é enviado imediatamente (síncrono)
   * WhatsApp é agendado assincronamente com delay de 15s
   */
  async send(payload: AuthDeliveryPayload): Promise<AuthDeliveryResult> {
    try {
      const { email, type, data, channels = ['email', 'whatsapp'] } = payload

      console.log(`[AuthDeliveryService] Iniciando entrega (${type}) para:`, email)

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          name: true,
          whatsapp: true,
        },
      })

      if (!user) {
        console.error(`[AuthDeliveryService] Usuário não encontrado:`, email)
        return {
          success: false,
          channel: 'none',
          error: 'user_not_found',
        }
      }

      console.log(`[AuthDeliveryService] Usuário encontrado:`, {
        email,
        hasWhatsapp: !!user.whatsapp,
        name: user.name,
      })

      // Renderizar template
      const template = await this.getTemplate(type, user.name || 'Usuário', data)

      let emailDelivered = false

      // Enviar email (síncrono)
      if (channels.includes('email')) {
        console.log(`[AuthDeliveryService] Enviando email para:`, email)

        const emailResult = await resendProvider.send({
          to: email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        })

        if (emailResult.success) {
          emailDelivered = true
          console.log(`[AuthDeliveryService] Email enviado com sucesso`)
        } else {
          console.error(`[AuthDeliveryService] Erro ao enviar email:`, emailResult.error)
        }
      }

      // Agendar WhatsApp (assíncrono com delay de 15s)
      if (channels.includes('whatsapp') && user.whatsapp) {
        const whatsappNumber = user.whatsapp
        const userName = user.name || 'Usuário'

        console.log(`[AuthDeliveryService] Agendando envio de WhatsApp para 15 segundos`)

        void (async () => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 15000))
            console.log(`[AuthDeliveryService] Enviando WhatsApp para:`, whatsappNumber)

            const message = this.getWhatsAppMessage(type, userName, data)

            const result = await sendTextMessage({
              phone: whatsappNumber,
              message,
            })

            console.log(`[AuthDeliveryService] Resultado WhatsApp:`, result)

            if (!result.status) {
              throw new Error(result.error || 'WhatsApp send failed')
            }

            console.log(`[AuthDeliveryService] WhatsApp enviado com sucesso`)
          } catch (whatsappError) {
            console.error(`[AuthDeliveryService] Erro ao enviar via WhatsApp:`, whatsappError)
          }
        })()
      }

      console.log(`[AuthDeliveryService] Status final - Email:`, emailDelivered)

      if (emailDelivered) {
        const finalResult = {
          success: true,
          channel: 'email' as const,
        }
        console.log(`[AuthDeliveryService] Entrega bem-sucedida:`, finalResult)
        return finalResult
      }

      const failureResult = {
        success: false,
        channel: 'none' as const,
        error: 'delivery_failed',
      }
      console.error(`[AuthDeliveryService] Entrega falhou:`, failureResult)
      return failureResult
    } catch (error) {
      console.error(`[AuthDeliveryService] Erro no serviço de entrega:`, error)
      console.error(
        `[AuthDeliveryService] Stack trace:`,
        error instanceof Error ? error.stack : 'N/A'
      )
      return {
        success: false,
        channel: 'none',
        error: 'internal_error',
      }
    }
  }

  /**
   * Renderiza o template de email apropriado baseado no tipo
   */
  private async getTemplate(
    type: DeliveryType,
    name: string,
    data: DeliveryData
  ): Promise<EmailTemplate> {
    if (type === 'magic-link') {
      const url = data.url
      const expiresIn = data.expiresIn ?? 20

      if (!url) {
        throw new Error('URL é obrigatória para envio de magic link')
      }

      const text = [
        `Olá ${name}!`,
        '',
        `Use o link a seguir para acessar sua conta: ${url}`,
        '',
        `Este link expira em ${expiresIn} minutos. Não compartilhe com ninguém.`,
        '',
        'Precisa de ajuda?',
        'WhatsApp: +55 11 4863-5262',
        'E-mail: contato@kadernim.com.br',
        'Endereço: Brasília - DF, Brasil',
      ].join('\n')

      const html = await render(
        MagicLinkEmail({
          name,
          magicLink: url,
          expiresIn,
        })
      )

      return {
        subject: '🔐 Seu link de acesso - Kadernim',
        text,
        html,
      }
    }

    const otp = data.otp
    const expiresIn = data.expiresIn ?? 5

    if (!otp) {
      throw new Error('OTP é obrigatório para envio deste tipo de mensagem')
    }

    const baseText = [
      `Olá ${name}!`,
      '',
      `Seu código de acesso é: ${otp}`,
      '',
      `Este código expira em ${expiresIn} minutos. Não compartilhe com ninguém.`,
      '',
      'Precisa de ajuda?',
      'WhatsApp: +55 11 4863-5262',
      'E-mail: contato@kadernim.com.br',
      'Endereço: Brasília - DF, Brasil',
    ].join('\n')

    const html = await render(
      OtpEmail({
        name,
        otp,
        expiresIn,
      })
    )

    const subjectMap: Record<Exclude<DeliveryType, 'magic-link'>, string> = {
      otp: '🔐 Seu código de acesso - Kadernim',
      'email-verification': '🔐 Código de verificação - Kadernim',
      'password-reset': '🔐 Código para redefinir senha - Kadernim',
    }

    const subject = subjectMap[type] ?? '🔐 Código de verificação - Kadernim'

    return {
      subject,
      text: baseText,
      html,
    }
  }

  /**
   * Gera mensagem WhatsApp apropriada baseada no tipo
   */
  private getWhatsAppMessage(type: DeliveryType, name: string, data: DeliveryData): string {
    switch (type) {
      case 'magic-link':
        return (
          `Olá ${name}! 🎉\n\n` +
          `🔐 *Acesse sua conta Kadernim:*\n\n${data.url}\n\n` +
          `⏰ Este link é válido por ${data.expiresIn || 20} minutos.\n\n` +
          `_Não compartilhe este link com ninguém._`
        )
      case 'otp':
      case 'email-verification':
      case 'password-reset':
        return (
          `Olá ${name}! 🎉\n\n` +
          `🔐 *Seu código de acesso:*\n\n*${data.otp}*\n\n` +
          `⏰ Este código é válido por ${data.expiresIn || 5} minutos.\n\n` +
          `_Não compartilhe este código com ninguém._`
        )
      default:
        return `Olá ${name}! Você recebeu uma mensagem de autenticação.`
    }
  }
}

export const authDeliveryService = new AuthDeliveryService()
