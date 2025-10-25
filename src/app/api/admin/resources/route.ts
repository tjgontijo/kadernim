import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

const resourcePayloadSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório'),
  description: z.string().trim().optional().default(''),
  imageUrl: z.string().trim().optional().default(''),
  isFree: z.boolean().optional().default(false),
  subjectId: z.string().trim().min(1, 'Disciplina é obrigatória'),
  educationLevelId: z.string().trim().min(1, 'Nível de ensino é obrigatório'),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParam = req.nextUrl.searchParams.get('search')?.trim()

    const resources = await prisma.resource.findMany({
      where: searchParam
        ? {
            title: {
              contains: searchParam,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        subject: {
          select: { id: true, name: true },
        },
        educationLevel: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error('[admin/resources][GET] erro ao listar recursos:', error)
    return NextResponse.json({ error: 'Erro ao listar recursos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = resourcePayloadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const { subjectId, educationLevelId, title, ...rest } = parsed.data

    const [subject, educationLevel] = await Promise.all([
      prisma.subject.findFirst({
        where: {
          OR: [{ id: subjectId }, { name: subjectId }],
        },
      }),
      prisma.educationLevel.findFirst({
        where: {
          OR: [{ id: educationLevelId }, { name: educationLevelId }],
        },
      }),
    ])

    if (!subject || !educationLevel) {
      return NextResponse.json(
        { error: 'Disciplina ou nível de ensino inválidos' },
        { status: 400 },
      )
    }

    const resource = await prisma.resource.create({
      data: {
        ...rest,
        title,
        subjectId: subject.id,
        educationLevelId: educationLevel.id,
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('[admin/resources][POST] erro ao criar recurso:', error)
    return NextResponse.json({ error: 'Erro ao criar recurso' }, { status: 500 })
  }
}
