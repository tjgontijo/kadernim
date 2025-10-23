// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../prisma'
import { admin, organization, magicLink } from 'better-auth/plugins'
import { deliverMagicLink } from '@/services/magic-link/magic-link-delivery'

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
      domain: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL,
      sameSite: 'none',
      secure: true,
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
        console.log('[magic-link] Iniciando entrega para:', email)
        console.log('[magic-link] URL gerada:', url)
        
        const result = await deliverMagicLink({ email, url })

        console.log('[magic-link] Resultado da entrega:', result)
        
        if (!result.success) {
          console.error('[magic-link] Entrega falhou', result.error)
        } else {
          console.log('[magic-link] Entrega bem-sucedida via', result.channel)
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
