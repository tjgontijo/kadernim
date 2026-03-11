import { prisma } from '@/lib/db'
import { AuditActor, PaymentMethod } from '@db'
import { buildCheckoutDescription, formatCheckoutCurrency, type CheckoutPlanId } from '@/lib/billing/checkout-offer'
import { AsaasClient } from './asaas-client'
import { BillingAuditService } from './audit.service'
import { BillingCatalogService } from './catalog.service'
import { CustomerService } from './customer.service'
import { billingLog } from './logger'

function todayDateString() {
  return new Date().toISOString().split('T')[0]
}

export class PixAutomaticService {
  static async createAuthorization(params: {
    userId: string
    cpfCnpj: string
    planId: CheckoutPlanId
  }) {
    const plan = await BillingCatalogService.getCheckoutPlan(params.planId)
    if (plan.id !== 'monthly') {
      throw new Error('PIX automático disponível apenas no plano mensal')
    }

    billingLog('info', 'Starting PIX Automático Authorization', {
      userId: params.userId,
      planId: params.planId,
    })

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, email: true, name: true, asaasCustomerId: true },
    })

    if (!user) throw new Error('User not found')

    let customerId = user.asaasCustomerId
    if (!customerId) {
      const newCustomer = await CustomerService.createOrGetCustomer({
        email: user.email,
        name: user.name,
        cpfCnpj: params.cpfCnpj,
      })
      customerId = newCustomer.asaasCustomerId
    } else {
      await CustomerService.updateCustomer(user.id, { cpfCnpj: params.cpfCnpj })
    }

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const contractId = `KADERNIM-SUB-${params.userId.substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`

    const authResponse = await AsaasClient.post<any>('/pix/automatic/authorizations', {
      customerId,
      frequency: 'MONTHLY',
      contractId,
      startDate: nextMonth.toISOString().split('T')[0],
      value: plan.pixAmount,
      description: buildCheckoutDescription(plan.id, 'pix-automatic'),
      immediateQrCode: {
        expirationSeconds: 3600,
        originalValue: plan.pixAmount,
        description: `Primeira parcela ${plan.label}`,
      },
    })

    const subscription = await prisma.subscription.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId,
        offerId: plan.pixOfferId,
        asaasId: authResponse.id,
        paymentMethod: PaymentMethod.PIX_AUTOMATIC,
        status: 'INACTIVE',
        isActive: false,
      },
      update: {
        offerId: plan.pixOfferId,
        asaasId: authResponse.id,
        paymentMethod: PaymentMethod.PIX_AUTOMATIC,
        status: 'INACTIVE',
        isActive: false,
      },
    })

    await BillingAuditService.log({
      userId: params.userId,
      actor: AuditActor.USER,
      action: 'PIX_AUTOMATIC_INITIATED',
      entity: 'Subscription',
      entityId: subscription.id,
      metadata: {
        asaasAuthId: authResponse.id,
        planId: plan.id,
        amount: plan.pixAmount,
      },
    })

    return {
      subscriptionId: subscription.id,
      authorizationId: authResponse.id,
      qrCodePayload: authResponse.payload,
      qrCodeImage: authResponse.encodedImage,
      expirationDate: authResponse.immediateQrCode?.expirationDate ?? todayDateString(),
      amountLabel: formatCheckoutCurrency(plan.pixAmount),
    }
  }

  static async getAuthorizationStatusForUser(authorizationId: string, userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { asaasId: authorizationId, userId },
      select: { status: true, asaasId: true },
    })

    if (!subscription) throw new Error('Authorization not found')
    return subscription
  }

  static async getAuthorizationStatusById(authorizationId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { asaasId: authorizationId },
      select: { status: true, asaasId: true },
    })

    if (!subscription) throw new Error('Authorization not found')
    return subscription
  }
}
