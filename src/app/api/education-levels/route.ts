import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

// GET /api/education-levels - Listar todos os níveis de ensino
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

    const educationLevels = await prisma.educationLevel.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(educationLevels)
  } catch (error) {
    console.error('Erro ao listar níveis de ensino:', error)
    return NextResponse.json(
      { message: 'Erro ao listar níveis de ensino' },
      { status: 500 }
    )
  }
}

// POST /api/education-levels - Criar um novo nível de ensino
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
    const { name, slug, ageRange } = body

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

    // Verificar se já existe um nível de ensino com o mesmo slug
    const existingEducationLevel = await prisma.educationLevel.findUnique({
      where: { slug: finalSlug },
    })

    if (existingEducationLevel) {
      return NextResponse.json(
        { message: 'Já existe um nível de ensino com este slug' },
        { status: 400 }
      )
    }

    // Criar o nível de ensino
    const educationLevel = await prisma.educationLevel.create({
      data: {
        name,
        slug: finalSlug,
        ageRange: ageRange || null,
      },
    })

    return NextResponse.json(educationLevel, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar nível de ensino:', error)
    return NextResponse.json(
      { message: 'Erro ao criar nível de ensino' },
      { status: 500 }
    )
  }
}
