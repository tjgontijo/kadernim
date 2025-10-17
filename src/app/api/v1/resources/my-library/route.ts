// src/app/api/v1/resources/my-library/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getMyLibrary } from '@/services/resources.service'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Autenticação
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Parâmetros de query
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '1000') // Buscar todos
    const subjectId = searchParams.get('subjectId') || undefined
    const educationLevelId = searchParams.get('educationLevelId') || undefined

    // Verificar se deve usar cache
    const hasFilters = Boolean(subjectId || educationLevelId || page > 1)

    const filters = { subjectId, educationLevelId }
    const pagination = { page, pageSize }

    // Função de busca
    const fetchData = async () => {
      return await getMyLibrary(userId, filters, pagination)
    }

    let data

    if (hasFilters) {
      // Sem cache para consultas filtradas
      data = await fetchData()
    } else {
      // Com cache para primeira página sem filtros
      const getCachedData = unstable_cache(
        fetchData,
        [`my-library-${userId}-${page}-${pageSize}`],
        {
          revalidate: 60, // 1 minuto
          tags: [`resources`, `user-${userId}`]
        }
      )
      data = await getCachedData()
    }

    // Headers de cache
    const headers: Record<string, string> = hasFilters
      ? {
          'Cache-Control': 'no-store'
        }
      : {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'private, max-age=60'
        }

    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Erro ao buscar biblioteca:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar recursos' },
      { status: 500 }
    )
  }
}
