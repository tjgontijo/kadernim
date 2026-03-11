import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { getResourceDetailForUser } from '@/services/resources/catalog'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id
    const role = session?.user?.role ?? null

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const parsed = await getResourceDetailForUser({
      resourceId: id,
      userId,
      role,
    })

    return NextResponse.json(
      { data: parsed },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, max-age=300',
        },
      }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Recurso não encontrado' },
        { status: 404 }
      )
    }

    console.error('Erro ao buscar recurso:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar o recurso' },
      { status: 500 }
    )
  }
}
