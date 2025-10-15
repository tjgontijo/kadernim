import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { z } from 'zod'
import { PlanPublicDTO } from '@/lib/schemas/plan'

const getActivePlans = unstable_cache(
  async () => {
    const rows = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        priceMonthly: true,
        durationDays: true,
        productId: true,
        store: true,
        isActive: true
      }
    })
    if (process.env.NODE_ENV !== 'production') {
      const ok = z.array(PlanPublicDTO).safeParse(rows)
      if (!ok.success) console.error('PlanPublicDTO inválido', ok.error.format())
    }
    return rows
  },
  ['plans:v1'],
  { revalidate: 600, tags: ['plans'] }
)

export async function GET() {
  try {
    const plans = await getActivePlans()
    return NextResponse.json(plans, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
    })
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
}
