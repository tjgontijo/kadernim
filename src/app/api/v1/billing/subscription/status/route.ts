import { NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user?.id },
      select: {
        id: true,
        status: true,
        isActive: true,
        failureReason: true,
        failureCount: true,
        lastFailureAt: true,
        lastFailureMessage: true,
        nextRetryAt: true,
        expiresAt: true,
        paymentMethod: true,
      },
    })

    if (!subscription) {
      return NextResponse.json({ subscription: null })
    }

    return NextResponse.json({ subscription })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
