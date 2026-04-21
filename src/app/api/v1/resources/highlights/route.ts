import { NextRequest, NextResponse } from 'next/server'
import { getResourceAccessContext, getResourceHighlights } from '@/lib/resources/services/catalog'
import { authorizeResourceListRequest } from '../route-support'

const HIGHLIGHTS_LIMIT = 10

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeResourceListRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const access = await getResourceAccessContext(authResult.userId, authResult.role)
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long' })
    const highlights = await getResourceHighlights({
      user: access.user,
      subscription: access.subscription,
      periodStart,
      limit: HIGHLIGHTS_LIMIT,
    })

    return NextResponse.json({
      data: highlights,
      meta: {
        monthLabel,
        periodStart: periodStart.toISOString(),
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar destaque de recursos:', error)
    return NextResponse.json({ error: 'Erro ao buscar destaque de recursos' }, { status: 500 })
  }
}
