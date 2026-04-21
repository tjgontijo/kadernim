import { NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const [subscription, invoices] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        select: {
          id: true,
          status: true,
          isActive: true,
          createdAt: true,
          expiresAt: true,
          paymentMethod: true,
          failureReason: true,
          failureCount: true,
          nextRetryAt: true,
          lastFailureMessage: true,
        },
      }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          value: true,
          dueDate: true,
          description: true,
          invoiceUrl: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({
      subscription,
      invoices,
    })
  } catch (error) {
    console.error('Erro ao buscar billing overview:', error)
    return NextResponse.json({ error: 'Erro ao buscar billing overview' }, { status: 500 })
  }
}
