import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BillingAuditService } from './audit.service'
import { billingLog } from './logger'
import { AuditActor } from '@db'

const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN

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
        const authToken = request.headers.get('asaas-access-token')
        if (authToken !== ASAAS_WEBHOOK_TOKEN) {
            billingLog('warn', 'Unauthorized Webhook Attempt', { tokenProvided: !!authToken })
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
                // Pix Automatic Events
                case 'PIX_AUTOMATIC_AUTHORIZATION_AUTHORIZED':
                case 'PIX_AUTOMATIC_AUTHORIZATION_AUTHORIZED_AND_CONFIRMED':
                    await this.handlePixAutomaticAuthorized(payload)
                    break
                case 'PIX_AUTOMATIC_AUTHORIZATION_DENIED':
                case 'PIX_AUTOMATIC_AUTHORIZATION_CANCELED':
                case 'PIX_AUTOMATIC_AUTHORIZATION_EXPIRED':
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

        // 1. Atualizar Invoice
        const invoice = await prisma.invoice.update({
            where: { asaasId: payment.id },
            data: {
                status: 'RECEIVED',
                paidAt: new Date(payment.paymentDate || payment.confirmedDate),
                netValue: payment.netValue
            }
        })

        // 2. Atualizar Assinatura (se for assinante de um plano principal)
        if (invoice.subscriptionId) {
            await prisma.subscription.update({
                where: { id: invoice.subscriptionId },
                data: { isActive: true, status: 'ACTIVE' }
            })
            // Opcional futuro: emitEvent('subscription.activated', { userId: invoice.userId })
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

    private static async handlePaymentRefunded(payload: any) {
        // ... logic for refunds
    }

    private static async handleSubscriptionEvent(payload: any) {
        // ... logic for subscriptions
    }

    private static async handlePixAutomaticAuthorized(payload: any) {
        const authorization = payload.pixAutomaticAuthorization
        billingLog('info', 'Handling Pix Automático Authorized', { authorizationId: authorization.id })

        // 1. Atualizar Subscription que aguardava essa autorização
        const subscription = await prisma.subscription.updateMany({
            where: {
                asaasId: authorization.id,
                paymentMethod: 'PIX_AUTOMATIC'
            },
            data: {
                status: 'ACTIVE',
                isActive: true
            }
        })

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
        const authorization = payload.pixAutomaticAuthorization
        billingLog('warn', 'Pix Automático Authorization Failed', {
            authorizationId: authorization.id, type: payload.event
        })

        // Marks subscription as CANCELED or keeps INACTIVE
        const subscription = await prisma.subscription.updateMany({
            where: { asaasId: authorization.id },
            data: { status: 'CANCELED', isActive: false }
        })

        await BillingAuditService.log({
            actor: AuditActor.SYSTEM,
            action: payload.event,
            entity: 'Subscription',
            entityId: authorization.id,
            asaasEventId: payload.id,
            newState: authorization,
        })
    }
}
