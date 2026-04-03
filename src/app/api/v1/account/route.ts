import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { getAccountProfile } from '@/lib/account/queries'
import { UpdateAccountSchema } from '@/lib/account/schemas'
import { updateAccountProfile } from '@/lib/account/services'
import { logger } from '@/server/logger'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getAccountProfile(session.user.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    logger.error(
      { route: '/api/v1/account', error: error instanceof Error ? error.message : String(error) },
      'Failed to fetch account profile'
    )
    return NextResponse.json(
      { error: 'Erro ao buscar dados da conta' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const parsed = UpdateAccountSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await updateAccountProfile(session.user.id, parsed.data)

    if (!result.success) {
      const status = result.error === 'User not found' ? 404 : 500
      return NextResponse.json(
        { error: result.error === 'User not found' ? result.error : 'Erro ao atualizar dados' },
        { status }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    logger.error(
      { route: '/api/v1/account', error: error instanceof Error ? error.message : String(error) },
      'Failed to update account profile'
    )
    return NextResponse.json(
      { error: 'Erro ao atualizar dados' },
      { status: 500 }
    )
  }
}
