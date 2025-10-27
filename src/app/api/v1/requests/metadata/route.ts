import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export async function GET() {
  try {
    const getMetadata = unstable_cache(
      async () => {
        const [educationLevels, subjects] = await Promise.all([
          prisma.educationLevel.findMany({
            orderBy: { name: 'asc' },
          }),
          prisma.subject.findMany({
            orderBy: { name: 'asc' },
          }),
        ])

        return {
          educationLevels,
          subjects,
        }
      },
      ['requests-metadata'],
      { revalidate: 3600, tags: ['requests-metadata'] } // Cache de 1 hora
    )

    const metadata = await getMetadata()

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Erro ao buscar metadata:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 }
    )
  }
}
