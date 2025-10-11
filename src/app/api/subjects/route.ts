import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

// GET /api/subjects - Listar todas as disciplinas
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    // Verificar se o usuário está autenticado e é admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 403 }
      )
    }

    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error)
    return NextResponse.json(
      { message: 'Erro ao listar disciplinas' },
      { status: 500 }
    )
  }
}

// POST /api/subjects - Criar uma nova disciplina
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    // Verificar se o usuário está autenticado e é admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, slug } = body

    // Validações básicas
    if (!name) {
      return NextResponse.json(
        { message: 'Nome é obrigatório' },
        { status: 400 }
      )
    }
    
    // Gerar slug automaticamente se não for fornecido
    const finalSlug = slug || name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    // Verificar se já existe uma disciplina com o mesmo slug
    const existingSubject = await prisma.subject.findUnique({
      where: { slug: finalSlug },
    })

    if (existingSubject) {
      return NextResponse.json(
        { message: 'Já existe uma disciplina com este slug' },
        { status: 400 }
      )
    }

    // Criar a disciplina
    const subject = await prisma.subject.create({
      data: {
        name,
        slug: finalSlug,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar disciplina:', error)
    return NextResponse.json(
      { message: 'Erro ao criar disciplina' },
      { status: 500 }
    )
  }
}
