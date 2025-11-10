import { NextResponse, NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'

import { EnrollmentPayloadSchema } from '@/lib/schemas/enroll'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { buildResourceCacheTag } from '@/lib/helpers/cache'

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

export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = EnrollmentPayloadSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Payload inválido',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const { store, name, email, phone, expiresAt, product_ids } = parsed.data

    // Verifica se o usuário já existe
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
      where: { email },
      data: {
        name,
        phone,
        emailVerified: true,
      },
    })

    const resources = await prisma.resource.findMany({
      where: {
        externalId: {
          in: product_ids,
        },
      },
      select: {
        id: true,
        externalId: true,
      },
    })

    if (resources.length === 0) {
      return NextResponse.json(
        {
          error: 'Nenhum recurso correspondente aos product_ids informados',
          product_ids,
        },
        { status: 404 }
      )
    }

    const existing: { resourceId: string; expiresAt: Date | null }[] = await prisma.userResourceAccess.findMany({
      where: {
        userId: user.id,
        resourceId: { in: resources.map((r) => r.id) },
      },
      select: { resourceId: true, expiresAt: true },
    })

    const mapExisting = new Map<string, Date | null>(
      existing.map((e) => [e.resourceId, e.expiresAt])
    )

    await Promise.all(
      resources.map((resource) => {
        const prev = mapExisting.get(resource.id) ?? null
        const nextExpires = prev === null || expiresAt === null
          ? null
          : prev.getTime() >= expiresAt.getTime()
            ? prev
            : expiresAt

        return prisma.userResourceAccess.upsert({
          where: {
            userId_resourceId: {
              userId: user.id,
              resourceId: resource.id,
            },
          },
          create: {
            userId: user.id,
            resourceId: resource.id,
            source: `${store}:${resource.externalId}`,
            expiresAt: expiresAt ?? null,
          },
          update: {
            source: `${store}:${resource.externalId}`,
            expiresAt: nextExpires,
          },
        })
      })
    )

    await revalidateTag(buildResourceCacheTag(user.id))

    return NextResponse.json(
      {
        message: 'Matrícula processada com sucesso',
        userId: user.id,
        granted: resources.map((resource) => resource.externalId),
        missing_product_ids: product_ids.filter(
          (productId) => !resources.some((resource) => resource.externalId === productId)
        ),
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao processar matrícula', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar matrícula' },
      { status: 500 }
    )
  }
}
