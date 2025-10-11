// src/app/api/education-levels/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'

type RouteParams = Promise<{ id: string }>

// GET /api/education-levels/[id]
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

    const educationLevel = await prisma.educationLevel.findUnique({ where: { id } })
    if (!educationLevel) {
      return NextResponse.json({ message: 'Nível de ensino não encontrado' }, { status: 404 })
    }

    return NextResponse.json(educationLevel)
  } catch (error) {
    console.error('Erro ao obter nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao obter nível de ensino' }, { status: 500 })
  }
}

// PUT /api/education-levels/[id]
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
    const { name, slug, ageRange } = await req.json()

    if (!name) {
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    }

    const finalSlug =
      (slug || name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

    const existing = await prisma.educationLevel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Nível de ensino não encontrado' }, { status: 404 })
    }

    const duplicate = await prisma.educationLevel.findFirst({
      where: { slug: finalSlug, NOT: { id } },
    })
    if (duplicate) {
      return NextResponse.json({ message: 'Já existe outro nível de ensino com este slug' }, { status: 400 })
    }

    const updated = await prisma.educationLevel.update({
      where: { id },
      data: { name, slug: finalSlug, ageRange: ageRange ?? null },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao atualizar nível de ensino' }, { status: 500 })
  }
}

// DELETE /api/education-levels/[id]
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

    const existing = await prisma.educationLevel.findUnique({
      where: { id },
      include: { resources: { select: { id: true }, take: 1 } },
    })
    if (!existing) {
      return NextResponse.json({ message: 'Nível de ensino não encontrado' }, { status: 404 })
    }

    if (existing.resources.length > 0) {
      return NextResponse.json(
        { message: 'Não é possível excluir um nível de ensino que possui recursos associados' },
        { status: 400 }
      )
    }

    await prisma.educationLevel.delete({ where: { id } })
    return NextResponse.json({ message: 'Nível de ensino excluído com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao excluir nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao excluir nível de ensino' }, { status: 500 })
  }
}
