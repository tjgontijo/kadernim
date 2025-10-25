// src/app/api/education-levels/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { UserRoleType } from '@/types/user-role'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/roles'
import { revalidateTag } from 'next/cache'
import { EducationLevelUpdateInput } from '@/lib/schemas/education-level'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || !isAdmin(session.user.role as UserRoleType)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params
    const educationLevel = await prisma.educationLevel.findUnique({ where: { id } })
    if (!educationLevel) {
      return NextResponse.json({ message: 'Nível de ensino não encontrado' }, { status: 404 })
    }

    return NextResponse.json(educationLevel, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Erro ao obter nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao obter nível de ensino' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || !isAdmin(session.user.role as UserRoleType)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params
    const body = await req.json()
    const parsed = EducationLevelUpdateInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', issues: parsed.error.format() }, { status: 400 })
    }

    const existing = await prisma.educationLevel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Nível de ensino não encontrado' }, { status: 404 })
    }

    const updated = await prisma.educationLevel.update({
      where: { id },
      data: { name: parsed.data.name }
    })

    revalidateTag('education-levels')

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao atualizar nível de ensino' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || !isAdmin(session.user.role as UserRoleType)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params

    const existing = await prisma.educationLevel.findUnique({
      where: { id },
      include: { resources: { select: { id: true }, take: 1 } }
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

    revalidateTag('education-levels')

    return NextResponse.json({ message: 'Nível de ensino excluído com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao excluir nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao excluir nível de ensino' }, { status: 500 })
  }
}
