import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../prisma'
import { magicLink, emailOTP } from 'better-auth/plugins'
import { deliverMagicLink } from '@/services/magic-link/magic-link-delivery'
import { admin } from 'better-auth/plugins'
import { organization } from 'better-auth/plugins'
import { authDeliveryService } from '@/services/delivery'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL,
  basePath: '/api/v1/auth',

  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  
  emailAndPassword: {
    enabled: true   
  },

  plugins: [
    admin(), 
    organization(),
    magicLink({
      expiresIn: 60 * 20, // 20 minutos
      sendMagicLink: async ({ email, url }) => {
        console.log('[magic-link] Iniciando entrega do magic link para:', email)
        
        try {
          await deliverMagicLink({ email, url })
          console.log('[magic-link] Magic link entregue com sucesso para:', email)
        } catch (error) {
          console.error('[magic-link] Erro ao entregar magic link:', error)
          throw error
        }
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log('[email-otp] Iniciando envio de OTP para:', email, 'tipo:', type)

        const result = await authDeliveryService.send({
          email,
          type: 'otp',
          data: {
            otp,
            expiresIn: 5,
          },
          channels: ['email', 'whatsapp'],
        })

        if (!result.success) {
          console.error('[email-otp] Falha ao entregar OTP', result)
          throw new Error(result.error ?? 'otp_delivery_failed')
        }
      },
    })
  ],

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false
      }
    }
  }
})

export type Auth = typeof auth
