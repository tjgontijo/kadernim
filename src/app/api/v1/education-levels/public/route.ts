// src/app/api/education-levels/public/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { z } from 'zod'
import { EducationLevelDTO } from '@/lib/schemas/education-level'

const getEducationLevels = unstable_cache(
  async () => {
    const rows = await prisma.educationLevel.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true }
    })
    if (process.env.NODE_ENV !== 'production') {
      const ok = z.array(EducationLevelDTO.pick({ id: true, name: true, slug: true })).safeParse(rows)
      if (!ok.success) console.error('EducationLevelDTO inválido', ok.error.format())
    }
    return rows
  },
  ['education-levels:v1'],
  { revalidate: 600, tags: ['education-levels'] }
)

export async function GET() {
  try {
    const educationLevels = await getEducationLevels()
    return NextResponse.json(educationLevels, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
    })
  } catch (error) {
    console.error('Erro ao listar níveis de ensino:', error)
    return NextResponse.json({ message: 'Erro ao listar níveis de ensino' }, { status: 500 })
  }
}
