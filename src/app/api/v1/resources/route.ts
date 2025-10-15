import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { ResourcesQueryDTO } from '@/lib/schemas/resource'
import { listOptimizedResources } from '@/domain/resources/optimized-list.service'

export const dynamic = 'force-dynamic' // Usar cache dinâmico

export async function GET(req: NextRequest) {
  try {
    // 🔹 Validação de parâmetros
    const qp = Object.fromEntries(req.nextUrl.searchParams)
    const parsed = ResourcesQueryDTO.safeParse(qp)
    
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Parâmetros inválidos', errors: parsed.error.format() }, 
        { status: 400 }
      )
    }
    
    // 🔹 Obter usuário (sem bloquear a resposta)
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id
    
    const normalizedQuery = {
      ...parsed.data,
      limit: Math.min(parsed.data.limit || 12, 50),
      page: Math.max(1, parsed.data.page || 1)
    }

    const hasFilters = Boolean(
      normalizedQuery.subjectId ||
      normalizedQuery.educationLevelId ||
      normalizedQuery.q ||
      (normalizedQuery.bnccCodes && normalizedQuery.bnccCodes.length > 0) ||
      normalizedQuery.page > 1
    )

    const data = await listOptimizedResources(userId, normalizedQuery)

    const headers: Record<string, string> = hasFilters
      ? {
          'Cache-Control': 'no-store'
        }
      : {
          'Cache-Control': userId
            ? 'private, max-age=60, stale-while-revalidate=300'
            : 'public, max-age=3600, stale-while-revalidate=7200',
          'CDN-Cache-Control': 'public, max-age=60',
          'Vercel-CDN-Cache-Control': 'public, max-age=60'
        }

    return NextResponse.json(data, { headers })
    
  } catch (e) {
    console.error('Erro ao buscar recursos otimizados:', e)
    return NextResponse.json(
      { message: 'Erro ao buscar recursos' }, 
      { status: 500 }
    )
  }
}
