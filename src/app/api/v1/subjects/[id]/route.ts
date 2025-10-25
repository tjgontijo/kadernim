// src/app/api/v1/subjects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { UserRoleType } from '@/types/user-role'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/roles'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { SubjectUpdateInput, SubjectDTO } from '@/lib/schemas/subject'

export const dynamic = 'force-dynamic'

// GET /api/v1/subjects/[id]
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || !isAdmin(session.user.role as UserRoleType)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params
    if (!id) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const row = await prisma.subject.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ message: 'Disciplina não encontrada' }, { status: 404 })

    // valida saída em dev
    if (process.env.NODE_ENV !== 'production') {
      const parsed = SubjectDTO.safeParse({ id: row.id, name: row.name })
      if (!parsed.success) console.error('SubjectDTO inválido', parsed.error.format())
    }

    return NextResponse.json(row, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Erro ao obter disciplina', error)
    return NextResponse.json({ message: 'Erro ao obter disciplina' }, { status: 500 })
  }
}

// PUT /api/v1/subjects/[id]
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || !isAdmin(session.user.role as UserRoleType)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params
    if (!id) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const body = await req.json()
    const parsed = SubjectUpdateInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', issues: parsed.error.format() }, { status: 400 })
    }

    const name = parsed.data.name

    const existing = await prisma.subject.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ message: 'Disciplina não encontrada' }, { status: 404 })

    const duplicate = await prisma.subject.findFirst({
      where: { name, NOT: { id } }
    })
    if (duplicate) {
      return NextResponse.json({ message: 'Já existe outra disciplina com este nome' }, { status: 400 })
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: { name }
    })

    revalidateTag('subjects')
    revalidateTag(`resources:subject:${id}`)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar disciplina', error)
    return NextResponse.json({ message: 'Erro ao atualizar disciplina' }, { status: 500 })
  }
}

// DELETE /api/v1/subjects/[id]
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || !isAdmin(session.user.role as UserRoleType)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params
    if (!id) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const existing = await prisma.subject.findUnique({
      where: { id },
      include: { resources: { select: { id: true }, take: 1 } }
    })
    if (!existing) return NextResponse.json({ message: 'Disciplina não encontrada' }, { status: 404 })

    if (existing.resources.length > 0) {
      return NextResponse.json(
        { message: 'Não é possível excluir uma disciplina que possui recursos associados' },
        { status: 400 }
      )
    }

    await prisma.subject.delete({ where: { id } })

    revalidateTag('subjects')
    revalidateTag(`resources:subject:${id}`)

    return NextResponse.json({ message: 'Disciplina excluída com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao excluir disciplina', error)
    return NextResponse.json({ message: 'Erro ao excluir disciplina' }, { status: 500 })
  }
}
