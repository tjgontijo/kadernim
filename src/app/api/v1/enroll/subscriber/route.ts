import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { buildResourceCacheTag } from '@/lib/helpers/cache'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { normalizeWhatsApp, validateWhatsApp } from '@/lib/helpers/phone'

export const dynamic = 'force-dynamic'

function validateApiKey(request: NextRequest) {
  const headerKey = request.headers.get('x-api-key')
  const expectedKey = process.env.WEBHOOK_API_KEY

  if (!expectedKey) {
    throw new Error('WEBHOOK_API_KEY não configurada')
  }

  if (!headerKey || headerKey !== expectedKey) {
    return false
  }

  return true
}

const SubscriberEnrollmentSchema = z
  .object({
    store: z
      .string({ message: 'Loja é obrigatória' })
      .trim()
      .min(1, { message: 'Loja inválida' }),
    name: z
      .string({ message: 'Nome é obrigatório' })
      .trim()
      .min(3, { message: 'Nome muito curto' })
      .max(120, { message: 'Nome muito longo' }),
    email: z
      .string({ message: 'Email é obrigatório' })
      .trim()
      .email({ message: 'Email inválido' }),
    phone: z
      .string({ message: 'Telefone é obrigatório' })
      .transform((value) => value.trim())
      .pipe(
        z
          .string()
          .refine((value) => validateWhatsApp(value), {
            message: 'Telefone inválido. Informe DDD + número com 10 ou 11 dígitos',
          })
          .transform((value) => normalizeWhatsApp(value)),
      ),
    expiresAt: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || !Number.isNaN(new Date(value).valueOf()),
        { message: 'Data de expiração inválida' }
      )
      .transform((value) => (value ? new Date(value) : null)),
  })
  .superRefine((data, ctx) => {
    if (data.expiresAt && Number.isNaN(data.expiresAt.valueOf())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiresAt'],
        message: 'Data de expiração inválida',
      })
    }
  })

export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = SubscriberEnrollmentSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const { name, email, phone, expiresAt } = parsed.data

    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      await (auth.api.signUpEmail as unknown as (params: { body: Record<string, unknown> }) => Promise<unknown>)({
        body: {
          name,
          email,
          password: crypto.randomUUID(),
        },
      })

      user = await prisma.user.findUniqueOrThrow({ where: { email } })
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone,
        emailVerified: true,
        role: user.role === 'admin' ? user.role : 'subscriber',
      },
    })

    const now = new Date()

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        isActive: true,
        purchaseDate: now,
        expiresAt: expiresAt ?? null,
      },
      create: {
        userId: user.id,
        isActive: true,
        purchaseDate: now,
        expiresAt: expiresAt ?? null,
      },
    })

    await revalidateTag(buildResourceCacheTag(user.id))

    return NextResponse.json(
      {
        message: 'Assinatura ativada com sucesso',
        userId: user.id,
        role: user.role,
        subscription: {
          isActive: subscription.isActive,
          purchaseDate: subscription.purchaseDate,
          expiresAt: subscription.expiresAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao processar assinatura', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar assinatura' },
      { status: 500 }
    )
  }
}
