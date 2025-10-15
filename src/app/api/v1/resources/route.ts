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
    
    // 🔹 Buscar recursos otimizados
    const data = await listOptimizedResources(userId, {
      ...parsed.data,
      // Garantir limites razoáveis
      limit: Math.min(parsed.data.limit || 12, 50),
      page: Math.max(1, parsed.data.page || 1)
    })
    
    // 🚀 Cache otimizado com stale-while-revalidate
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': userId 
          ? 'private, max-age=60, stale-while-revalidate=300' 
          : 'public, max-age=3600, stale-while-revalidate=7200',
        'CDN-Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': 'public, max-age=60'
      }
    })
    
  } catch (e) {
    console.error('Erro ao buscar recursos otimizados:', e)
    return NextResponse.json(
      { message: 'Erro ao buscar recursos' }, 
      { status: 500 }
    )
  }
}
