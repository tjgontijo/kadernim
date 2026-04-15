import { prisma } from '@/lib/db'
import { authDeliveryService } from '@/services/delivery/auth-delivery'
import { isValidBrazilianPhone } from '@/lib/utils/phone'
import { calculateNextRetryDate, getPixFailureMessage } from './pix-failure.helper'
import { billingLog } from './logger'
import { BillingAuditService } from './audit.service'
import { AuditActor } from '@db'

export class SubscriptionService {
  static async retryPixAutomaticPayment(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true, invoices: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })

    if (!subscription) {
      billingLog('warn', 'Subscription not found for retry', { subscriptionId })
      return null
    }

    if (subscription.status !== 'FAILED') {
      billingLog('warn', 'Subscription not in FAILED state for retry', {
        subscriptionId,
        status: subscription.status,
      })
      return null
    }

    if (subscription.nextRetryAt && new Date() < subscription.nextRetryAt) {
      billingLog('info', 'Retry scheduled too soon, must wait', { subscriptionId })
      return subscription
    }

    const now = new Date()

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        lastRetryAt: now,
        nextRetryAt: subscription.failureCount >= 2 ? calculateNextRetryDate(subscription.failureCount + 1) : null,
      },
      include: { user: true },
    })

    billingLog('info', 'PIX automatic payment retry attempted', {
      subscriptionId,
      failureCount: updated.failureCount,
    })

    await BillingAuditService.log({
      actor: AuditActor.USER,
      action: 'PIX_AUTOMATIC_PAYMENT_RETRY_ATTEMPT',
      entity: 'Subscription',
      entityId: subscriptionId,
      metadata: { failureCount: updated.failureCount, lastFailureReason: updated.failureReason },
    })

    return updated
  }

  static async sendFailureReminder(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    })

    if (!subscription || !subscription.user) {
      return false
    }

    try {
      const failureMessage = getPixFailureMessage(subscription.failureReason!)
      const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/retry/${subscriptionId}`

      const channels: Array<'email' | 'whatsapp'> = ['email']

      if (isValidBrazilianPhone(subscription.user.phone)) {
        channels.push('whatsapp')
      }

      const deliveryPayload = {
        email: subscription.user.email,
        type: 'pix-failure' as const,
        channels,
        data: {
          failureReason: subscription.failureReason || 'UNKNOWN',
          failureMessage: failureMessage,
          retryUrl: retryUrl,
          subscriptionId,
        },
      }

      await authDeliveryService.send(deliveryPayload)

      billingLog('info', 'Failure reminder sent', { subscriptionId, channels })

      return true
    } catch (error: any) {
      billingLog('error', 'Failed to send failure reminder', { subscriptionId, error: error.message })
      return false
    }
  }

  static async cancelAfterFailures(subscriptionId: string, reason?: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    })

    if (!subscription) {
      return null
    }

    const previousState = { ...subscription }

    const cancelled = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELED', isActive: false, canceledAt: new Date() },
      include: { user: true },
    })

    if (subscription.user) {
      try {
        await authDeliveryService.send({
          email: subscription.user.email,
          type: 'magic-link',
          channels: ['email'],
          data: { url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/plans`, name: subscription.user.name },
        })
      } catch (error: any) {
        billingLog('error', 'Failed to send cancellation notification', { subscriptionId, error: error.message })
      }
    }

    await BillingAuditService.log({
      actor: AuditActor.SYSTEM,
      action: 'SUBSCRIPTION_CANCELED_AFTER_FAILURES',
      entity: 'Subscription',
      entityId: subscriptionId,
      previousState,
      newState: cancelled,
      metadata: { reason: reason || 'Multiple payment failures', failureCount: subscription.failureCount },
    })

    billingLog('warn', 'Subscription canceled after multiple failures', {
      subscriptionId,
      failureCount: subscription.failureCount,
    })

    return cancelled
  }
}
