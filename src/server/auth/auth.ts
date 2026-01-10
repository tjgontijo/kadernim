import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/db'
import { emailOTP, admin, organization } from 'better-auth/plugins'
import { emitEvent } from '@/lib/inngest'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: '/api/v1/auth',

  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          // Busca o email do usuário
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true }
          });

          if (user?.email) {
            await emitEvent('user.login', {
              userId: session.userId,
              email: user.email,
              method: session.userAgent || 'unknown',
            });
          }
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true
  },

  plugins: [
    admin(),
    organization(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type: _ }) {
        // Emitir evento para o Inngest processar via templates
        // O handler handleOtpRequested envia por Email e/ou WhatsApp
        await emitEvent('auth.otp.requested', {
          email,
          otp,
          expiresIn: 15, // minutos
        });

        console.log(`[email-otp] Evento auth.otp.requested emitido para ${email}`);
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
            console.log(`[auth] Novo lead criado: ${body.email}`)
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

