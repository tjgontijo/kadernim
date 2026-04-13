import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/db'
import { emailOTP, admin, organization } from 'better-auth/plugins'
import { UserRoleType } from '@/types/users/user-role'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: '/api/v1/auth',

  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  advanced: {
    database: {
      generateId: false,
    },
  },



  emailAndPassword: {
    enabled: true
  },

  plugins: [
    admin(),
    organization(),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        try {
          const { authDeliveryService } = await import('@/services/delivery/auth-delivery');

          await authDeliveryService.send({
            email,
            type: 'otp',
            data: {
              otp,
              expiresIn: 15
            }
          });
        } catch (error) {
          console.error('[Auth] Erro ao enviar código de verificação:', error);
        }
      },
    })
  ],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Auto-cadastro de leads no fluxo de OTP
      if (ctx.path.includes('send-verification-otp')) {
        const body = ctx.body as { email?: string }
        if (body?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
            select: { id: true },
          })

          // Se o usuário não existe, criamos na hora como lead (role: user)
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: body.email,
                name: body.email.split('@')[0],
                role: 'user',
                emailVerified: false,
              },
            })
          }
        }
      }
    }),
  },

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

