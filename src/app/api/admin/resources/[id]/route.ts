import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const resourcePayloadSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório'),
  description: z.string().trim().optional().default(''),
  imageUrl: z.string().trim().optional().default(''),
  isFree: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  subjectId: z.string().trim().min(1, 'Disciplina é obrigatória'),
  educationLevelId: z.string().trim().min(1, 'Nível de ensino é obrigatório'),
})

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await ctx.params

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        educationLevel: { select: { id: true, name: true } },
        files: true,
        externalMappings: true,
      },
    })

    if (!resource) {
      return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error('[admin/resources/[id]][GET] erro ao buscar recurso:', error)
    return NextResponse.json({ error: 'Erro ao buscar recurso' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await ctx.params
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
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.educationLevel.findUnique({ where: { id: educationLevelId } }),
    ])

    if (!subject || !educationLevel) {
      return NextResponse.json(
        { error: 'Disciplina ou nível de ensino inválidos' },
        { status: 400 },
      )
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...rest,
        title,
        subjectId: subject.id,
        educationLevelId: educationLevel.id,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[admin/resources/[id]][PUT] erro ao atualizar recurso:', error)
    return NextResponse.json({ error: 'Erro ao atualizar recurso' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await ctx.params

    await prisma.resource.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/resources/[id]][DELETE] erro ao deletar recurso:', error)
    return NextResponse.json({ error: 'Erro ao deletar recurso' }, { status: 500 })
  }
}
