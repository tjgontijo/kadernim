// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../prisma'
import { admin, organization } from 'better-auth/plugins'

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

  plugins: [admin(), organization()],

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
