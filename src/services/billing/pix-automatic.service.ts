import { prisma } from '@/lib/db'
import { AsaasClient } from './asaas-client'
import { CustomerService } from './customer.service'
import { billingLog } from './logger'
import { BillingAuditService } from './audit.service'
import { AuditActor, PaymentMethod } from '@db'

const PLAN_VALUE = 49.90
const PLAN_NAME = 'Kadernim Pro'

export class PixAutomaticService {
    /**
     * Initializes a Pix Automático Authorization
     * Returns the immediate QR Code which the user MUST pay to confirm the recurrent authorization.
     */
    static async createAuthorization(userId: string, cpfCnpj: string) {
        billingLog('info', 'Starting PIX Automático Authorization', { userId })

        // 1. Get or setup Customer
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, asaasCustomerId: true }
        })

        if (!user) throw new Error('User not found')

        let customerId = user.asaasCustomerId

        if (!customerId) {
            const newCustomer = await CustomerService.createOrGetCustomer({
                email: user.email,
                name: user.name,
                cpfCnpj
            })
            customerId = newCustomer.asaasCustomerId
        } else {
            await CustomerService.updateCustomer(user.id, { cpfCnpj })
        }

        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)

        // We will use our internal ID string as contractId
        const contractId = `KADERNIM-SUB-${userId.substring(0, 10).toUpperCase()}`

        // 2. Create the Authorization
        // Asaas will create the first tracking payment within this structure using immediateQrCode
        const authPayload = {
            customerId,
            frequency: 'MONTHLY',
            contractId,
            startDate: nextMonth.toISOString().split('T')[0], // First recurrent charge is next month
            value: PLAN_VALUE,
            description: `Assinatura ${PLAN_NAME} (Pix Automático)`,
            immediateQrCode: {
                expirationSeconds: 3600, // 1 hour to pay the first invoice
                originalValue: PLAN_VALUE,
                description: `Primeira Parcela ${PLAN_NAME}`
            }
        }

        const authResponse = await AsaasClient.post<any>('/pix/automatic/authorizations', authPayload)

        // Auth is not active yet. Status will be AWAITING_AUTHORIZATION.
        billingLog('info', 'Asaas PIX Automatic Authorization Created', { authorizationId: authResponse.id })

        // 3. Mark the subscription locally as INACTIVE/AWAITING_AUTHORIZATION
        const subscription = await prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                asaasId: authResponse.id, // We store the auth ID as Asaas ID
                paymentMethod: PaymentMethod.PIX_AUTOMATIC,
                status: 'INACTIVE', // Requires the immediate payment to become active
                isActive: false,
            },
            update: {
                asaasId: authResponse.id,
                paymentMethod: PaymentMethod.PIX_AUTOMATIC,
                status: 'INACTIVE',
            }
        })

        await BillingAuditService.log({
            userId,
            actor: AuditActor.USER,
            action: 'PIX_AUTOMATIC_INITIATED',
            entity: 'Subscription',
            entityId: subscription.id,
            metadata: { asaasAuthId: authResponse.id }
        })

        return {
            subscription,
            authorizationId: authResponse.id,
            qrCodePayload: authResponse.immediateQrCode?.payload,
            qrCodeImage: authResponse.immediateQrCode?.encodedImage,
            expirationDate: authResponse.immediateQrCode?.expirationDate
        }
    }

    /**
     * Status Polling for Pix Automatic immediate QR Code
     */
    static async getAuthorizationStatus(authorizationId: string, userId: string) {
        const sub = await prisma.subscription.findFirst({
            where: { asaasId: authorizationId, userId },
            select: { status: true, asaasId: true }
        })
        if (!sub) throw new Error('Authorization not found')
        return sub
    }
}
