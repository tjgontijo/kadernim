import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../prisma'
import { magicLink } from 'better-auth/plugins'
import { nodemailerProvider } from '@/services/mail/nodemailer'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL,
  basePath: '/api/v1/auth',

  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  plugins: [
    magicLink({
      expiresIn: 60 * 20, // 20 minutos
      sendMagicLink: async ({ email, url }) => {        
        await nodemailerProvider.send({
          to: email,
          subject: 'Seu link de acesso - Kadernim',
          html: `
            <p>Olá!</p>
            <p>Clique no link abaixo para acessar sua conta:</p>
            <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
              Acessar Conta
            </a>
            <p>Este link expira em 20 minutos.</p>
            <p>Se você não solicitou este email, ignore-o.</p>
          `
        })
        
        console.log('[magic-link] Email enviado com sucesso')
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
      }
    }
  }
})

export type Auth = typeof auth
