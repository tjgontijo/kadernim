// src/app/api/subjects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'

export const dynamic = 'force-dynamic'

type RouteParams = Promise<{ id: string }>

// GET /api/subjects/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await params

    const subject = await prisma.subject.findUnique({ where: { id } })
    if (!subject) {
      return NextResponse.json({ message: 'Disciplina não encontrada' }, { status: 404 })
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Erro ao obter disciplina:', error)
    return NextResponse.json({ message: 'Erro ao obter disciplina' }, { status: 500 })
  }
}

// PUT /api/subjects/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await params
    const { name, slug } = await req.json()

    if (!name) {
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    const existing = await prisma.subject.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Disciplina não encontrada' }, { status: 404 })
    }

    const duplicate = await prisma.subject.findFirst({
      where: { slug: finalSlug, NOT: { id } },
    })
    if (duplicate) {
      return NextResponse.json({ message: 'Já existe outra disciplina com este slug' }, { status: 400 })
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: { name, slug: finalSlug },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error)
    return NextResponse.json({ message: 'Erro ao atualizar disciplina' }, { status: 500 })
  }
}

// DELETE /api/subjects/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.subject.findUnique({
      where: { id },
      include: { resources: { select: { id: true }, take: 1 } },
    })
    if (!existing) {
      return NextResponse.json({ message: 'Disciplina não encontrada' }, { status: 404 })
    }

    if (existing.resources.length > 0) {
      return NextResponse.json(
        { message: 'Não é possível excluir uma disciplina que possui recursos associados' },
        { status: 400 }
      )
    }

    await prisma.subject.delete({ where: { id } })
    return NextResponse.json({ message: 'Disciplina excluída com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao excluir disciplina:', error)
    return NextResponse.json({ message: 'Erro ao excluir disciplina' }, { status: 500 })
  }
}
