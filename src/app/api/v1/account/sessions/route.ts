import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { RevokeSessionsSchema } from '@/schemas/account/account-schemas'
import {
  listAccountSessions,
  revokeAccountSessions,
} from '@/services/account/account-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/account/sessions
 * Lista todas as sessões ativas do usuário
 */
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionsWithCurrent = await listAccountSessions(
      session.user.id,
      session.session?.id ?? null
    )

    return NextResponse.json({ sessions: sessionsWithCurrent })
  } catch (error) {
    console.error('[GET /api/v1/account/sessions]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sessões' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/account/sessions
 * Revoga todas as outras sessões (mantém a atual)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id || !session?.session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = RevokeSessionsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await revokeAccountSessions(
      session.user.id,
      session.session.id,
      parsed.data.revokeAll
    )

    return NextResponse.json({
      message: parsed.data.revokeAll
        ? 'Todas as sessões foram encerradas'
        : 'Outras sessões encerradas',
      count: result.count,
    })
  } catch (error) {
    console.error('[DELETE /api/v1/account/sessions]', error)
    return NextResponse.json(
      { error: 'Erro ao revogar sessões' },
      { status: 500 }
    )
  }
}
