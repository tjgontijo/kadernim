import { prisma } from '@/lib/db'
import { AsaasClient } from './asaas-client'
import { CustomerService } from './customer.service'
import { SplitService } from './split.service'
import { billingLog } from './logger'
import { BillingAuditService } from './audit.service'
import { AuditActor, PaymentMethod, InvoiceStatus } from '@db'

const PLAN_VALUE = 49.90 // Assumed default plan value
const PLAN_NAME = 'Kadernim Pro'

export class PaymentService {
    /**
     * Initializes a PIX checkout
     * Ensures the customer has a CPF/CNPJ and generates the first invoice + QR Code
     */
    static async createPixSubscription(userId: string, cpfCnpj: string) {
        billingLog('info', 'Starting PIX Checkout', { userId })

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
            // Always update CPF in Asaas to be safe
            await CustomerService.updateCustomer(user.id, { cpfCnpj })
        }

        // 2. Build Split Instructions
        const split = await SplitService.buildSplitPayload()

        // 3. Create Subscription in Asaas
        const asaasSub = await AsaasClient.post<any>('/subscriptions', {
            customer: customerId,
            billingType: 'PIX',
            cycle: 'MONTHLY',
            value: PLAN_VALUE,
            nextDueDate: new Date().toISOString().split('T')[0], // Hoje
            description: `Assinatura ${PLAN_NAME}`,
            split
        })

        billingLog('info', 'Asaas PIX Subscription created', { subscriptionId: asaasSub.id })

        // 4. Fetch the first payment generated for this subscription
        const payments = await AsaasClient.get<any>(`/subscriptions/${asaasSub.id}/payments`)
        const firstPayment = payments.data[0]

        if (!firstPayment) {
            throw new Error('Asaas failed to generate the first payment for the subscription')
        }

        // 5. Fetch PIX QR Code payload for the first payment
        const qrCode = await AsaasClient.get<any>(`/payments/${firstPayment.id}/pixQrCode`)

        // 6. Create Local Subscription and Invoice
        const subscription = await prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                asaasId: asaasSub.id,
                status: 'INACTIVE',
                paymentMethod: PaymentMethod.PIX,
                isActive: false,
            },
            update: {
                asaasId: asaasSub.id,
                paymentMethod: PaymentMethod.PIX,
                status: 'INACTIVE',
            }
        })

        const invoice = await prisma.invoice.create({
            data: {
                userId,
                subscriptionId: subscription.id,
                asaasId: firstPayment.id,
                status: InvoiceStatus.PENDING,
                paymentMethod: PaymentMethod.PIX,
                value: firstPayment.value,
                netValue: firstPayment.netValue,
                description: firstPayment.description,
                billingType: 'PIX',
                dueDate: new Date(firstPayment.dueDate),
                invoiceUrl: firstPayment.invoiceUrl,
                pixQrCode: JSON.stringify(qrCode)
            }
        })

        await BillingAuditService.log({
            userId,
            actor: AuditActor.USER,
            action: 'CHECKOUT_PIX_INITIATED',
            entity: 'Invoice',
            entityId: invoice.id,
            metadata: { asaasSubId: asaasSub.id, invoiceAsaasId: firstPayment.id }
        })

        return {
            subscription,
            invoice,
            qrCodePayload: qrCode.payload,
            qrCodeImage: qrCode.encodedImage, // base64
            expirationDate: qrCode.expirationDate
        }
    }

    /**
     * Initializes a Credit Card checkout
     */
    static async createCreditCardSubscription(
        userId: string,
        cpfCnpj: string,
        creditCard: {
            holderName: string
            number: string
            expiryMonth: string
            expiryYear: string
            ccv: string
        }
    ) {
        billingLog('info', 'Starting Credit Card Checkout', { userId })

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
            // Always update CPF in Asaas to be safe
            await CustomerService.updateCustomer(user.id, { cpfCnpj })
        }

        // 2. Build Split Instructions
        const split = await SplitService.buildSplitPayload()

        // 3. Create Subscription in Asaas
        // We set a Remote IP dynamically or leave it empty depending on exact requirements.
        // Asaas requires remoteIp for credit card transactions usually, but we bypass for now if sandbox allows.
        const asaasSub = await AsaasClient.post<any>('/subscriptions', {
            customer: customerId,
            billingType: 'CREDIT_CARD',
            cycle: 'MONTHLY',
            value: PLAN_VALUE,
            nextDueDate: new Date().toISOString().split('T')[0], // Hoje
            description: `Assinatura ${PLAN_NAME}`,
            split,
            creditCard: {
                ...creditCard,
                holderInfo: { // Required by Assas for some anti fraud policies, we can omit or send minimal
                    name: user.name,
                    email: user.email,
                    cpfCnpj: cpfCnpj
                }
            }
        })

        billingLog('info', 'Asaas Credit Card Subscription created', { subscriptionId: asaasSub.id })

        // 4. Fetch the first payment generated
        const payments = await AsaasClient.get<any>(`/subscriptions/${asaasSub.id}/payments`)
        const firstPayment = payments.data[0]

        if (!firstPayment) {
            throw new Error('Asaas failed to generate the first payment for the subscription')
        }

        // 5. Create Local Subscription and Invoice
        const subscription = await prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                asaasId: asaasSub.id,
                status: 'ACTIVE',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                isActive: false,
            },
            update: {
                asaasId: asaasSub.id,
                paymentMethod: PaymentMethod.CREDIT_CARD,
                status: 'ACTIVE',
            }
        })

        const invoiceStatus = firstPayment.status === 'CONFIRMED' || firstPayment.status === 'RECEIVED'
            ? InvoiceStatus.RECEIVED
            : InvoiceStatus.PENDING

        const invoice = await prisma.invoice.create({
            data: {
                userId,
                subscriptionId: subscription.id,
                asaasId: firstPayment.id,
                status: invoiceStatus,
                paymentMethod: PaymentMethod.CREDIT_CARD,
                value: firstPayment.value,
                netValue: firstPayment.netValue,
                description: firstPayment.description,
                billingType: 'CREDIT_CARD',
                dueDate: new Date(firstPayment.dueDate),
                invoiceUrl: firstPayment.invoiceUrl,
            }
        })

        // Se já confirmou imediato
        if (invoice.status === 'RECEIVED') {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: { isActive: true }
            })
        }

        await BillingAuditService.log({
            userId,
            actor: AuditActor.USER,
            action: 'CHECKOUT_CREDIT_CARD_INITIATED',
            entity: 'Invoice',
            entityId: invoice.id,
            metadata: { asaasSubId: asaasSub.id, invoiceAsaasId: firstPayment.id }
        })

        return {
            subscription,
            invoice,
            status: invoice.status
        }
    }

    /**
     * Retrieves the status of an invoice for polling
     */
    static async getInvoiceStatus(invoiceId: string, userId: string) {
        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId },
            select: { status: true, asaasId: true }
        })
        if (!invoice) throw new Error('Invoice not found')
        return invoice
    }
}
