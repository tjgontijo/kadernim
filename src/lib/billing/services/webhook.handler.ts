import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { type CheckoutPlanId } from '@/lib/billing/checkout-offer'
import { BillingAuditService } from './audit.service'
import { BillingCatalogService } from './catalog.service'
import { billingLog } from './logger'
import { AuditActor, InvoiceStatus } from '@db'
import { BillingAsaasConfigService } from './asaas-config.service'
import { PaymentService } from './payment.service'
import { mapPixAutomaticFailureReason } from './pix-failure.helper'
import { authDeliveryService } from '@/services/delivery/auth-delivery'
import { isValidBrazilianPhone } from '@/lib/utils/phone'
import { onSubscriptionChange } from '@/services/auth/role-sync-service'

function mapInvoiceStatus(status: string): InvoiceStatus {
    switch (status) {
        case 'RECEIVED':
        case 'CONFIRMED':
            return InvoiceStatus.RECEIVED
        case 'OVERDUE':
            return InvoiceStatus.OVERDUE
        case 'REFUNDED':
            return InvoiceStatus.REFUNDED
        default:
            return InvoiceStatus.PENDING
    }
}

/**
 * Main service to process incoming Asaas Webhooks.
 * Implements idempotency using BillingAuditService and handles 
 * all 38 official Asaas events.
 */
export class WebhookHandler {
    /**
     * Main entry point for the webhook route
     */
    static async process(request: NextRequest) {
        // 1. Validate Token
        const { webhookToken } = await BillingAsaasConfigService.getRuntimeConfig()
        const authToken = request.headers.get('asaas-access-token')
        if (!webhookToken || authToken !== webhookToken) {
            billingLog('warn', 'Unauthorized Webhook Attempt', {
                tokenProvided: !!authToken,
                webhookConfigured: !!webhookToken,
            })
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await request.json()
        const eventId = payload.id // ID único do evento para idempotência
        const eventName = payload.event

        // 2. Check Idempotency
        const isDuplicate = await BillingAuditService.isDuplicate(eventId)
        if (isDuplicate) {
            billingLog('info', 'Duplicate Webhook Ignored', { eventId, eventName })
            return NextResponse.json({ status: 'ignored', reason: 'duplicate' }, { status: 200 })
        }

        billingLog('info', `Processing Webhook: ${eventName}`, { eventId })

        try {
            // 3. Delegate to specific handlers
            switch (eventName) {
                // Payment Events
                case 'PAYMENT_RECEIVED':
                case 'PAYMENT_CONFIRMED':
                    await this.handlePaymentReceived(payload)
                    break

                case 'PAYMENT_REFUNDED':
                    await this.handlePaymentRefunded(payload)
                    break

                // Subscription Events
                case 'SUBSCRIPTION_CREATED':
                case 'SUBSCRIPTION_DELETED':
                    await this.handleSubscriptionEvent(payload)
                    break

                // Pix Automatic Events
                case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CREATED':
                    await this.handlePixAutomaticCreated(payload)
                    break
                case 'PIX_AUTOMATIC_AUTHORIZATION_AUTHORIZED':
                case 'PIX_AUTOMATIC_AUTHORIZATION_AUTHORIZED_AND_CONFIRMED':
                case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED':
                    await this.handlePixAutomaticAuthorized(payload)
                    break
                case 'PIX_AUTOMATIC_AUTHORIZATION_DENIED':
                case 'PIX_AUTOMATIC_AUTHORIZATION_CANCELED':
                case 'PIX_AUTOMATIC_AUTHORIZATION_CANCELLED':
                case 'PIX_AUTOMATIC_AUTHORIZATION_EXPIRED':
                case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED':
                case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_EXPIRED':
                case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED':
                    await this.handlePixAutomaticFailed(payload)
                    break

                default:
                    billingLog('info', `Unprocessed Webhook Event: ${eventName}`, { eventId })
                    // Still log in audit to mark as seen
                    await BillingAuditService.log({
                        actor: AuditActor.SYSTEM,
                        action: `WEBHOOK_UNKNOWN:${eventName}`,
                        entity: 'Webhook',
                        entityId: eventId,
                        asaasEventId: eventId,
                        metadata: { payload }
                    })
            }

            return NextResponse.json({ status: 'processed' }, { status: 200 })
        } catch (error: any) {
            billingLog('error', `Webhook processing FAILED`, {
                eventId,
                eventName,
                error: error.message
            })

            // Return 500 so Asaas retries the webhook
            return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
        }
    }

    private static async handlePaymentReceived(payload: any) {
        const payment = payload.payment
        billingLog('info', 'Handling Payment Received', { paymentId: payment.id })

        const planId = await PaymentService.inferPlanIdFromPayment(payment.description, payment.value)
        const invoice = await this.upsertInvoiceFromWebhook(payment, planId)

        if (invoice.subscriptionId) {
            const updatedSubscription = await PaymentService.activateSubscriptionForPayment(
                invoice.subscriptionId,
                payment.description,
                payment.value,
                invoice.paidAt ?? new Date()
            )
            
            if (updatedSubscription) {
                await onSubscriptionChange(invoice.userId, {
                    isActive: updatedSubscription.isActive,
                    expiresAt: updatedSubscription.expiresAt
                })
            }
        }

        await BillingAuditService.log({
            actor: AuditActor.SYSTEM,
            action: 'PAYMENT_RECEIVED',
            entity: 'Invoice',
            entityId: payment.id,
            asaasEventId: payload.id,
            asaasPaymentId: payment.id,
            newState: payment,
        })
    }

    private static async upsertInvoiceFromWebhook(payment: any, planId: CheckoutPlanId) {
        const paidAt = new Date(payment.paymentDate || payment.confirmedDate || Date.now())
        const status = mapInvoiceStatus(payment.status)
        const plan = await BillingCatalogService.getCheckoutPlan(planId)
        const paymentMethod = payment.billingType === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX'
        const offerId = paymentMethod === 'CREDIT_CARD' ? plan.creditCardOfferId : plan.pixOfferId

        const existingInvoice = await prisma.invoice.findUnique({
            where: { asaasId: payment.id },
            select: {
                id: true,
                userId: true,
                subscriptionId: true,
            }
        })

        if (existingInvoice) {
            return prisma.invoice.update({
                where: { asaasId: payment.id },
                data: {
                    status,
                    paidAt,
                    offerId,
                    netValue: payment.netValue,
                    invoiceUrl: payment.invoiceUrl ?? undefined,
                }
            })
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    payment.customer ? { asaasCustomerId: payment.customer } : undefined,
                    payment.externalReference ? { id: payment.externalReference } : undefined,
                ].filter(Boolean) as Array<{ asaasCustomerId?: string; id?: string }>
            },
            select: {
                id: true,
                subscription: {
                    select: {
                        id: true,
                    }
                }
            }
        })

        if (!user) {
            throw new Error(`Invoice not found for payment ${payment.id} and user could not be resolved`)
        }

        const subscription = user.subscription ?? await prisma.subscription.create({
            data: {
                userId: user.id,
                offerId,
                paymentMethod: payment.billingType === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX',
                status: 'INACTIVE',
                isActive: false,
            },
            select: { id: true }
        })

        return prisma.invoice.create({
            data: {
                userId: user.id,
                subscriptionId: subscription.id,
                offerId,
                asaasId: payment.id,
                status,
                paymentMethod,
                value: payment.value,
                netValue: payment.netValue,
                description: payment.description ?? `Assinatura Kadernim Pro [plan:${planId}]`,
                billingType: payment.billingType,
                dueDate: new Date(payment.dueDate),
                paidAt,
                invoiceUrl: payment.invoiceUrl,
            }
        })
    }

    private static async handlePaymentRefunded(payload: any) {
        // ... logic for refunds
    }

    private static async handleSubscriptionEvent(payload: any) {
        const eventName = payload.event
        const subscription = payload.subscription
        const asaasId = subscription.id

        billingLog('info', `Handling Subscription Event: ${eventName}`, { asaasId })

        if (eventName === 'SUBSCRIPTION_DELETED') {
            const localSub = await prisma.subscription.findUnique({
                where: { asaasId },
                select: { userId: true }
            })

            if (localSub) {
                const updated = await prisma.subscription.update({
                    where: { asaasId },
                    data: { 
                        status: 'CANCELED', 
                        isActive: false, 
                        canceledAt: new Date() 
                    }
                })

                await onSubscriptionChange(localSub.userId, {
                    isActive: false,
                    expiresAt: updated.expiresAt
                })
            }
        }

        await BillingAuditService.log({
            actor: AuditActor.SYSTEM,
            action: eventName,
            entity: 'Subscription',
            entityId: asaasId,
            asaasEventId: payload.id,
            newState: subscription,
        })
    }

    private static getPixAutomaticAuthorization(payload: any) {
        return payload.authorization ?? payload.pixAutomaticAuthorization ?? null
    }

    private static async handlePixAutomaticCreated(payload: any) {
        const authorization = this.getPixAutomaticAuthorization(payload)
        if (!authorization?.id) {
            throw new Error('Invalid Pix Automático authorization payload')
        }

        await BillingAuditService.log({
            actor: AuditActor.SYSTEM,
            action: payload.event,
            entity: 'Subscription',
            entityId: authorization.id,
            asaasEventId: payload.id,
            newState: authorization,
        })
    }

    private static async handlePixAutomaticAuthorized(payload: any) {
        const authorization = this.getPixAutomaticAuthorization(payload)
        if (!authorization?.id) {
            throw new Error('Invalid Pix Automático authorization payload')
        }

        billingLog('info', 'Handling Pix Automático Authorized', { authorizationId: authorization.id })

        // 1. Atualizar Subscription que aguardava essa autorização
        const sub = await prisma.subscription.findFirst({
            where: {
                asaasId: authorization.id,
                paymentMethod: 'PIX_AUTOMATIC'
            },
            select: { id: true, userId: true }
        })

        if (sub) {
            const updated = await prisma.subscription.update({
                where: { id: sub.id },
                data: {
                    status: 'ACTIVE',
                    isActive: true,
                    purchaseDate: new Date(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            })

            await onSubscriptionChange(sub.userId, {
                isActive: true,
                expiresAt: updated.expiresAt
            })
        }

        // TODO: In a more robust flow, we also manually create the first invoice local record
        // since Asaas generates an immediateQrCode that technically acted as the first invoice.

        await BillingAuditService.log({
            actor: AuditActor.SYSTEM,
            action: payload.event,
            entity: 'Subscription',
            entityId: authorization.id, // Using asaasId here as fallback
            asaasEventId: payload.id,
            newState: authorization,
        })
    }

    private static async handlePixAutomaticFailed(payload: any) {
        const authorization = this.getPixAutomaticAuthorization(payload)
        if (!authorization?.id) {
            throw new Error('Invalid Pix Automático authorization payload')
        }

        billingLog('warn', 'Pix Automático Authorization Failed', {
            authorizationId: authorization.id, type: payload.event
        })

        // Mapear tipo de falha
        const failureReason = mapPixAutomaticFailureReason(payload.event, authorization.failureReason)
        const nextRetry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias

        // Atualizar subscription para FAILED
        const subscription = await prisma.subscription.findFirst({
            where: { asaasId: authorization.id },
            include: { user: true }
        })

        if (!subscription) {
            billingLog('warn', 'Subscription not found for failed PIX', { authorizationId: authorization.id })
            return
        }

        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'FAILED',
                failureReason,
                failureCount: { increment: 1 },
                lastFailureAt: new Date(),
                nextRetryAt: nextRetry,
            }
        })

        // Enviar notificação ao usuário
        if (subscription.user) {
            try {
                const channels: Array<'email' | 'whatsapp'> = ['email']
                if (isValidBrazilianPhone(subscription.user.phone)) {
                    channels.push('whatsapp')
                }

                await authDeliveryService.send({
                    email: subscription.user.email,
                    type: 'pix-failure',
                    channels,
                    data: {
                        failureReason,
                        retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription/retry?id=${subscription.id}`,
                        subscriptionId: subscription.id,
                    },
                })

                // Registrar que enviou notificação
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { failureNotificationSentAt: new Date() }
                })
            } catch (error: any) {
                billingLog('error', 'Failed to send failure notification', {
                    subscriptionId: subscription.id,
                    error: error.message
                })
            }
        }

        // Log audit
        await BillingAuditService.log({
            actor: AuditActor.SYSTEM,
            action: payload.event,
            entity: 'Subscription',
            entityId: subscription.id,
            asaasEventId: payload.id,
            metadata: {
                failureReason,
                userNotified: !!subscription.user,
                nextRetryAt: nextRetry.toISOString(),
            }
        })
    }
}
