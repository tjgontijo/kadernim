// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../prisma'
import { admin, organization, magicLink } from 'better-auth/plugins'
import { sendTextMessage } from '@/lib/whatsapp/uazapi/send-message'
import { normalizeWhatsApp } from '@/lib/masks/whatsapp'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,

  basePath: '/api/v1/auth',
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL,
  
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') || undefined,

  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  session: { 
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    }
  },

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    admin(), 
    organization(),
    magicLink({      
      expiresIn: 60 * 20,
      sendMagicLink: async ({ email, url }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user?.whatsapp) {
            console.warn('[magic-link] Usuário sem WhatsApp cadastrado, pulando envio via WhatsApp.')
            return
          }

          try {
            const normalizedPhone = normalizeWhatsApp(user.whatsapp)

            const message = `Olá ${user.name ?? ''}! 🎉\n\n` +
              `🔐 *Acesse sua conta Kadernim:*\n\n${url}\n\n` +
              `⏰ Este link é válido por 20 minutos.\n\n` +
              `_Não compartilhe este link com ninguém._`

            const result = await sendTextMessage({
              phone: normalizedPhone,
              message
            })

            if (!result.status) {
              console.error('[magic-link] Falha ao enviar mensagem via WhatsApp:', result.error)
            }
          } catch (whatsappError) {
            console.error('[magic-link] Erro ao enviar magic link via WhatsApp:', whatsappError)
          }
        } catch (error) {
          console.error('[magic-link] Erro no callback sendMagicLink:', error)
        }
      }
    })
  ],

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false
      },
      subscriptionTier: {
        type: 'string',
        required: false
      },
      whatsapp: {
        type: 'string',
        required: false,
        input: true // Permite receber no signup
      }
    }
  }
})

export type Auth = typeof auth
