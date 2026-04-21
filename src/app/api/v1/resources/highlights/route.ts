import { NextRequest, NextResponse } from 'next/server'
import { getResourceAccessContext, getResourceHighlights } from '@/lib/resources/services/catalog'
import { authorizeResourceListRequest } from '../route-support'

const HIGHLIGHTS_WINDOW_DAYS = 30
const HIGHLIGHTS_LIMIT = 10

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeResourceListRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const access = await getResourceAccessContext(authResult.userId, authResult.role)
    const highlights = await getResourceHighlights({
      user: access.user,
      subscription: access.subscription,
      windowDays: HIGHLIGHTS_WINDOW_DAYS,
      limit: HIGHLIGHTS_LIMIT,
    })

    return NextResponse.json({
      data: highlights,
      meta: {
        windowDays: HIGHLIGHTS_WINDOW_DAYS,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar destaque de recursos:', error)
    return NextResponse.json({ error: 'Erro ao buscar destaque de recursos' }, { status: 500 })
  }
}
