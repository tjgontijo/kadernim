import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'

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

    const sessions = await prisma.session.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mark current session
    const currentSessionToken = session.session?.token
    const sessionsWithCurrent = sessions.map(s => ({
      ...s,
      isCurrent: s.id === currentSessionToken,
    }))

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
    const { revokeAll } = body as { revokeAll?: boolean }

    if (revokeAll) {
      // Revoke ALL sessions including current (for "logout everywhere")
      const result = await prisma.session.deleteMany({
        where: { userId: session.user.id },
      })

      return NextResponse.json({
        message: 'Todas as sessões foram encerradas',
        count: result.count,
      })
    } else {
      // Revoke all except current session
      const result = await prisma.session.deleteMany({
        where: {
          userId: session.user.id,
          id: { not: session.session.id },
        },
      })

      return NextResponse.json({
        message: 'Outras sessões encerradas',
        count: result.count,
      })
    }
  } catch (error) {
    console.error('[DELETE /api/v1/account/sessions]', error)
    return NextResponse.json(
      { error: 'Erro ao revogar sessões' },
      { status: 500 }
    )
  }
}
