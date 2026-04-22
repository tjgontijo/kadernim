import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { BnccSkillDetailResponseSchema } from '@/lib/bncc/schemas/bncc-schemas'
import { getBnccSkillById } from '@/lib/bncc/services/bncc-service'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params

    if (!id) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const skill = await getBnccSkillById(id)

    if (!skill) {
      return NextResponse.json({ error: 'Habilidade BNCC nao encontrada' }, { status: 404 })
    }

    const payload = BnccSkillDetailResponseSchema.parse({ data: skill })
    return NextResponse.json(payload)
  } catch (error) {
    console.error('Erro ao buscar habilidade BNCC:', error)
    return NextResponse.json({ error: 'Erro ao buscar habilidade BNCC' }, { status: 500 })
  }
}

