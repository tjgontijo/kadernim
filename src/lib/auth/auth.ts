import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../prisma'
import { magicLink, emailOTP } from 'better-auth/plugins'
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
        const result = await authDeliveryService.send({
          email,
          type: 'magic-link',
          data: {
            url,
            expiresIn: 20,
          },
          channels: ['email', 'whatsapp'],
        })

        if (!result.success) {
          throw new Error(result.error ?? 'magic_link_delivery_failed')
        }
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type: _ }) {
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
