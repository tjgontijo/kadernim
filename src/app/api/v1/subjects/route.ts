import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { SubjectCreateInput, SubjectDTO } from '@/lib/schemas/subject'
import { slugify } from '@/lib/slug'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const rows = await prisma.subject.findMany({ orderBy: { name: 'asc' } })
    if (process.env.NODE_ENV !== 'production') {
      const parsed = z.array(SubjectDTO).safeParse(rows.map(r => ({ id: r.id, name: r.name, slug: r.slug })))
      if (!parsed.success) console.error('SubjectDTO inválido', parsed.error.format())
    }

    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Erro ao listar disciplinas', error)
    return NextResponse.json({ message: 'Erro ao listar disciplinas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = SubjectCreateInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', issues: parsed.error.format() }, { status: 400 })
    }

    const name = parsed.data.name
    const finalSlug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(name)

    const duplicate = await prisma.subject.findUnique({ where: { slug: finalSlug } })
    if (duplicate) {
      return NextResponse.json({ message: 'Já existe uma disciplina com este slug' }, { status: 400 })
    }

    const subject = await prisma.subject.create({ data: { name, slug: finalSlug } })

    revalidateTag('subjects')

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar disciplina', error)
    return NextResponse.json({ message: 'Erro ao criar disciplina' }, { status: 500 })
  }
}
