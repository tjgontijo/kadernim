// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../prisma'
import { admin, organization, magicLink } from 'better-auth/plugins'
import { deliverMagicLink } from '@/services/magic-link/magic-link-delivery'

console.log('[auth] Inicializando better-auth com config:')
console.log('[auth] NODE_ENV:', process.env.NODE_ENV)
console.log('[auth] DATABASE_URL configurada:', !!process.env.DATABASE_URL)
console.log('[auth] DIRECT_URL configurada:', !!process.env.DIRECT_URL)
console.log('[auth] BETTER_AUTH_SECRET configurada:', !!process.env.BETTER_AUTH_SECRET)

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
        console.log('[auth] ========== MAGIC LINK CALLBACK INICIADO ==========')
        console.log('[auth] Email:', email)
        console.log('[auth] Token URL:', url)
        console.log('[auth] Timestamp:', new Date().toISOString())
        console.log('[auth] NODE_ENV:', process.env.NODE_ENV)
        
        // Verificar se o token foi salvo no banco
        try {
          const token = url.split('token=')[1]?.split('&')[0]
          if (token) {
            const verification = await prisma.verification.findFirst({
              where: { value: token }
            })
            console.log('[auth] Token encontrado no banco?', !!verification)
            if (verification) {
              console.log('[auth] Verificação encontrada:', { id: verification.id, identifier: verification.identifier, expiresAt: verification.expiresAt })
            } else {
              console.error('[auth] ⚠️ TOKEN NÃO FOI SALVO NO BANCO!')
            }
          }
        } catch (checkError) {
          console.error('[auth] Erro ao verificar token no banco:', checkError)
        }
        
        try {
          const result = await deliverMagicLink({ email, url })

          console.log('[auth] Resultado da entrega:', result)
          
          if (!result.success) {
            console.error('[auth] Entrega falhou', result.error)
          } else {
            console.log('[auth] Entrega bem-sucedida via', result.channel)
          }
        } catch (callbackError) {
          console.error('[auth] Erro no callback sendMagicLink:', callbackError)
          console.error('[auth] Stack trace:', callbackError instanceof Error ? callbackError.stack : 'N/A')
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
