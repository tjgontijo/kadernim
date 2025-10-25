import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { z } from 'zod'
import { SubjectDTO } from '@/lib/schemas/subject'

const getSubjects = unstable_cache(
  async () => {
    const rows = await prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    if (process.env.NODE_ENV !== 'production') {
      const parsed = z.array(SubjectDTO).safeParse(rows)
      if (!parsed.success) console.error('SubjectDTO inválido', parsed.error.format())
    }
    return rows
  },
  ['subjects:v1'],
  { revalidate: 600, tags: ['subjects'] }
)

export async function GET() {
  try {
    const subjects = await getSubjects()
    return NextResponse.json(subjects, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Erro ao listar disciplinas', error)
    return NextResponse.json({ message: 'Erro ao listar disciplinas' }, { status: 500 })
  }
}
