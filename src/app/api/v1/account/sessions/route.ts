import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { listAccountSessions } from '@/lib/account/queries'
import { RevokeSessionsSchema } from '@/lib/account/schemas'
import { revokeAccountSessions } from '@/lib/account/services'
import { logger } from '@/server/logger'

export const dynamic = 'force-dynamic'

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
    logger.error(
      { route: '/api/v1/account/sessions', error: error instanceof Error ? error.message : String(error) },
      'Failed to list account sessions'
    )
    return NextResponse.json(
      { error: 'Erro ao buscar sessões' },
      { status: 500 }
    )
  }
}

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

    if (!result.success) {
      return NextResponse.json(
        { error: 'Erro ao revogar sessões' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: parsed.data.revokeAll
        ? 'Todas as sessões foram encerradas'
        : 'Outras sessões encerradas',
      count: result.data.count,
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/account/sessions', error: error instanceof Error ? error.message : String(error) },
      'Failed to revoke account sessions'
    )
    return NextResponse.json(
      { error: 'Erro ao revogar sessões' },
      { status: 500 }
    )
  }
}
