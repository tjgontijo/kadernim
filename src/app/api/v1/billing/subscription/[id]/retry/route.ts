import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'
import { SubscriptionService } from '@/lib/billing/services/subscription.service'
import { billingLog } from '@/lib/billing/services/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.userId !== session.user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (subscription.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Subscription is not in failed state' },
        { status: 400 }
      )
    }

    // Check rate limiting - must wait for nextRetryAt
    if (subscription.nextRetryAt && new Date() < subscription.nextRetryAt) {
      const waitMs = subscription.nextRetryAt.getTime() - Date.now()
      const waitSeconds = Math.ceil(waitMs / 1000)

      billingLog('info', 'Retry rate limited', { subscriptionId: id, waitSeconds })

      return NextResponse.json(
        { error: 'Please wait before retrying again', retryAfterSeconds: waitSeconds },
        { status: 429 }
      )
    }

    // Update lastRetryAt
    const result = await prisma.subscription.update({
      where: { id },
      data: {
        lastRetryAt: new Date(),
      },
    })

    billingLog('info', 'Subscription retry attempted', { subscriptionId: id })

    return NextResponse.json({
      success: true,
      subscription: {
        id: result.id,
        status: result.status,
        failureCount: result.failureCount,
      },
    })
  } catch (error: any) {
    billingLog('error', 'Subscription retry failed', { error: error.message })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
