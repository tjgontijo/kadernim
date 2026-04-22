import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { BnccSkillFilterSchema, BnccSkillsListResponseSchema } from '@/lib/bncc/schemas/bncc-schemas'
import { listBnccSkills } from '@/lib/bncc/services/bncc-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = BnccSkillFilterSchema.safeParse({
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      educationLevel: request.nextUrl.searchParams.get('educationLevel') ?? undefined,
      grades: request.nextUrl.searchParams.getAll('grade'),
      subject: request.nextUrl.searchParams.get('subject') ?? undefined,
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    const result = await listBnccSkills(parsed.data)

    const payload = BnccSkillsListResponseSchema.parse({
      data: result.items,
      pagination: result.pagination,
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Erro ao listar habilidades BNCC:', error)
    return NextResponse.json({ error: 'Erro ao listar habilidades BNCC' }, { status: 500 })
  }
}
