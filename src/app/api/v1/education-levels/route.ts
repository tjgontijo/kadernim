// src/app/api/education-levels/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { EducationLevelCreateInput, EducationLevelDTO } from '@/lib/schemas/education-level'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const rows = await prisma.educationLevel.findMany({ orderBy: { name: 'asc' } })
    if (process.env.NODE_ENV !== 'production') {
      const parsed = EducationLevelDTO.array().safeParse(rows.map(r => ({ id: r.id, name: r.name })))
      if (!parsed.success) {
        console.error('Erro ao parsear níveis de ensino:', parsed.error.format())
      }
    }

    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Erro ao listar níveis de ensino:', error)
    return NextResponse.json({ message: 'Erro ao listar níveis de ensino' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = EducationLevelCreateInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', issues: parsed.error.format() }, { status: 400 })
    }

    const name = parsed.data.name

    const dup = await prisma.educationLevel.findUnique({ where: { name } })
    if (dup) {
      return NextResponse.json({ message: 'Já existe um nível de ensino com este nome' }, { status: 400 })
    }

    const educationLevel = await prisma.educationLevel.create({
      data: { name }
    })

    revalidateTag('education-levels')

    return NextResponse.json(educationLevel, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao criar nível de ensino' }, { status: 500 })
  }
}
