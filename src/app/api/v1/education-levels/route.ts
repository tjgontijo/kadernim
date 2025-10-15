// src/app/api/education-levels/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { EducationLevelCreateInput } from '@/lib/schemas/education-level'
import { slugify } from '@/lib/slug'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const educationLevels = await prisma.educationLevel.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(educationLevels, { headers: { 'Cache-Control': 'no-store' } })
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
    const finalSlug = slugify(parsed.data.slug ?? name)

    const dup = await prisma.educationLevel.findUnique({ where: { slug: finalSlug } })
    if (dup) {
      return NextResponse.json({ message: 'Já existe um nível de ensino com este slug' }, { status: 400 })
    }

    const educationLevel = await prisma.educationLevel.create({
      data: { name, slug: finalSlug, ageRange: parsed.data.ageRange ?? null }
    })

    revalidateTag('education-levels')

    return NextResponse.json(educationLevel, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar nível de ensino:', error)
    return NextResponse.json({ message: 'Erro ao criar nível de ensino' }, { status: 500 })
  }
}
