import { prisma } from '@/lib/db'
import { AuditActor, InvoiceStatus, PaymentMethod } from '@db'
import {
  buildCheckoutDescription,
  extractCheckoutBillingMode,
  extractCheckoutPlanId,
  formatCheckoutCurrency,
  getAnnualCardInstallment,
  type CheckoutBillingMode,
  type CheckoutPlanId,
} from '@/lib/billing/checkout-offer'
import { normalizeCpfCnpj } from '@/lib/utils/cpf-cnpj'
import { AsaasClient } from './asaas-client'
import { BillingAuditService } from './audit.service'
import { BillingCatalogService } from './catalog.service'
import { CustomerService } from './customer.service'
import { billingLog } from './logger'
import { SplitService } from './split.service'

type BillingUser = {
  id: string
  email: string
  name: string
  phone: string | null
  asaasCustomerId: string
}

type AsaasPayment = {
  id: string
  customer?: string
  externalReference?: string
  status: string
  value: number
  netValue?: number
  description?: string
  billingType: string
  dueDate: string
  invoiceUrl?: string
  paymentDate?: string
  confirmedDate?: string
}

type AsaasInstallment = {
  id: string
}

type PixQrCodeResponse = {
  payload: string
  encodedImage: string
  expirationDate: string
}

type AsaasAnticipation = {
  id: string
  status: string
}

function todayDateString() {
  return new Date().toISOString().split('T')[0]
}

function normalizePhone(phone?: string | null) {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  return digits.length > 0 ? digits : undefined
}

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

function isPaidStatus(status: InvoiceStatus) {
  return status === InvoiceStatus.RECEIVED || status === InvoiceStatus.CONFIRMED
}

function buildCheckoutExpirationDate(accessDays: number, referenceDate = new Date()) {
  const expiresAt = new Date(referenceDate)
  expiresAt.setDate(expiresAt.getDate() + accessDays)
  return expiresAt
}

async function inferPlanId(description?: string | null, value?: number): Promise<CheckoutPlanId> {
  const fromDescription = extractCheckoutPlanId(description)
  if (fromDescription) {
    return fromDescription
  }

  return BillingCatalogService.inferPlanIdFromAmount(value)
}

async function ensureBillingUser(userId: string, cpfCnpj: string, phone?: string) {
  const normalizedCpfCnpj = normalizeCpfCnpj(cpfCnpj)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      asaasCustomerId: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const normalizedPhone = normalizePhone(phone ?? user.phone)
  let customerId = user.asaasCustomerId

  if (!customerId) {
    const customer = await CustomerService.createOrGetCustomer({
      email: user.email,
      name: user.name,
      cpfCnpj: normalizedCpfCnpj,
      phone: normalizedPhone,
    })
    customerId = customer.asaasCustomerId ?? null
  } else {
    await CustomerService.updateCustomer(user.id, {
      cpfCnpj: normalizedCpfCnpj,
      phone: normalizedPhone,
      mobilePhone: normalizedPhone,
    })
  }

  if (!customerId) {
    throw new Error('Asaas customer not available')
  }

  if (normalizedPhone && normalizedPhone !== user.phone) {
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: normalizedPhone },
    })
  }

  return {
    ...user,
    phone: normalizedPhone ?? user.phone,
    asaasCustomerId: customerId,
  } satisfies BillingUser
}

async function upsertCheckoutSubscription(params: {
  userId: string
  offerId: string
  paymentMethod: PaymentMethod
  asaasId: string
}) {
  return prisma.subscription.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      offerId: params.offerId,
      asaasId: params.asaasId,
      paymentMethod: params.paymentMethod,
      status: 'INACTIVE',
      isActive: false,
      purchaseDate: new Date(),
      expiresAt: null,
      canceledAt: null,
      pixAutomaticAuthId: null,
    },
    update: {
      offerId: params.offerId,
      asaasId: params.asaasId,
      paymentMethod: params.paymentMethod,
      status: 'INACTIVE',
      isActive: false,
      purchaseDate: new Date(),
      expiresAt: null,
      canceledAt: null,
      pixAutomaticAuthId: null,
    },
  })
}

async function upsertInvoice(params: {
  userId: string
  subscriptionId: string
  offerId: string
  paymentMethod: PaymentMethod
  payment: AsaasPayment
  pixQrCode?: PixQrCodeResponse
}) {
  const status = mapInvoiceStatus(params.payment.status)
  const paidAt = isPaidStatus(status)
    ? new Date(params.payment.paymentDate ?? params.payment.confirmedDate ?? Date.now())
    : null

  return prisma.invoice.upsert({
    where: { asaasId: params.payment.id },
    create: {
      userId: params.userId,
      subscriptionId: params.subscriptionId,
      offerId: params.offerId,
      asaasId: params.payment.id,
      status,
      paymentMethod: params.paymentMethod,
      value: params.payment.value,
      netValue: params.payment.netValue,
      description: params.payment.description,
      billingType: params.payment.billingType,
      dueDate: new Date(params.payment.dueDate),
      paidAt,
      invoiceUrl: params.payment.invoiceUrl,
      pixQrCode: params.pixQrCode ? JSON.stringify(params.pixQrCode) : null,
    },
    update: {
      subscriptionId: params.subscriptionId,
      offerId: params.offerId,
      status,
      paymentMethod: params.paymentMethod,
      value: params.payment.value,
      netValue: params.payment.netValue,
      description: params.payment.description,
      billingType: params.payment.billingType,
      dueDate: new Date(params.payment.dueDate),
      paidAt,
      invoiceUrl: params.payment.invoiceUrl,
      pixQrCode: params.pixQrCode ? JSON.stringify(params.pixQrCode) : undefined,
    },
  })
}

async function activateSubscription(
  subscriptionId: string,
  planId: CheckoutPlanId,
  referenceDate = new Date(),
  options: { billingMode?: CheckoutBillingMode | null } = {},
) {
  const plan = await BillingCatalogService.getCheckoutPlan(planId)
  const current = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { isActive: true, expiresAt: true },
  })

  if (!current) {
    throw new Error('Subscription not found')
  }

  if (
    planId === 'annual'
    && options.billingMode === 'installment'
    && current.isActive
    && current.expiresAt
    && current.expiresAt > referenceDate
  ) {
    return
  }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      isActive: true,
      status: 'ACTIVE',
      purchaseDate: referenceDate,
      expiresAt: buildCheckoutExpirationDate(plan.accessDays, referenceDate),
      canceledAt: null,
    },
  })
}

function buildCreditCardHolderInfo(user: BillingUser, cpfCnpj: string) {
  const phone = normalizePhone(user.phone)

  return {
    name: user.name,
    email: user.email,
    cpfCnpj: normalizeCpfCnpj(cpfCnpj),
    phone,
    mobilePhone: phone,
  }
}

async function listSubscriptionPayments(subscriptionId: string) {
  const payments = await AsaasClient.get<{ data: AsaasPayment[] }>(`/subscriptions/${subscriptionId}/payments`)
  return payments.data
}

async function listInstallmentPayments(installmentId: string) {
  const payments = await AsaasClient.get<{ data: AsaasPayment[] }>(`/installments/${installmentId}/payments`)
  return payments.data
}

async function requestInstallmentAnticipation(installmentId: string) {
  const formData = new FormData()
  formData.append('installment', installmentId)

  try {
    return await AsaasClient.postForm<AsaasAnticipation>('/anticipations', formData)
  } catch (error: any) {
    billingLog('warn', 'Installment anticipation request failed', {
      installmentId,
      error: error.message,
    })
    return null
  }
}

export class PaymentService {
  static async createPixSubscription(params: {
    userId: string
    cpfCnpj: string
    planId: CheckoutPlanId
  }) {
    const plan = await BillingCatalogService.getCheckoutPlan(params.planId)

    billingLog('info', 'Starting PIX checkout', {
      userId: params.userId,
      planId: params.planId,
    })

    const user = await ensureBillingUser(params.userId, params.cpfCnpj)
    const split = await SplitService.buildSplitPayload()
    const description = buildCheckoutDescription(plan.id, 'single')

    const payment = await AsaasClient.post<AsaasPayment>('/payments', {
      customer: user.asaasCustomerId,
      billingType: 'PIX',
      value: plan.pixAmount,
      dueDate: todayDateString(),
      description,
      split,
      externalReference: params.userId,
    })

    const qrCode = await AsaasClient.get<PixQrCodeResponse>(`/payments/${payment.id}/pixQrCode`)
    const subscription = await upsertCheckoutSubscription({
      userId: params.userId,
      offerId: plan.pixOfferId,
      paymentMethod: PaymentMethod.PIX,
      asaasId: payment.id,
    })
    const invoice = await upsertInvoice({
      userId: params.userId,
      subscriptionId: subscription.id,
      offerId: plan.pixOfferId,
      paymentMethod: PaymentMethod.PIX,
      payment,
      pixQrCode: qrCode,
    })

    if (isPaidStatus(invoice.status)) {
      const paidAt = new Date(payment.paymentDate ?? payment.confirmedDate ?? Date.now())
      await activateSubscription(subscription.id, plan.id, paidAt, { billingMode: 'single' })
    }

    await BillingAuditService.log({
      userId: params.userId,
      actor: AuditActor.USER,
      action: 'CHECKOUT_PIX_INITIATED',
      entity: 'Invoice',
      entityId: invoice.id,
      metadata: {
        invoiceAsaasId: payment.id,
        planId: plan.id,
        amount: plan.pixAmount,
      },
    })

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      qrCodePayload: qrCode.payload,
      qrCodeImage: qrCode.encodedImage,
      expirationDate: qrCode.expirationDate,
      amountLabel: formatCheckoutCurrency(plan.pixAmount),
    }
  }

  static async createCreditCardSubscription(params: {
    userId: string
    cpfCnpj: string
    planId: CheckoutPlanId
    installments: number
    remoteIp?: string
    creditCard: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    }
  }) {
    const plan = await BillingCatalogService.getCheckoutPlan(params.planId)

    if (plan.id === 'annual') {
      if (params.installments > 1) {
        return this.createAnnualCreditCardInstallment(params)
      }

      return this.createAnnualCreditCardPayment(params)
    }

    return this.createMonthlyCreditCardSubscription(params)
  }

  private static async createMonthlyCreditCardSubscription(params: {
    userId: string
    cpfCnpj: string
    planId: CheckoutPlanId
    remoteIp?: string
    creditCard: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    }
  }) {
    const plan = await BillingCatalogService.getCheckoutPlan(params.planId)
    billingLog('info', 'Starting monthly credit card subscription', {
      userId: params.userId,
      planId: plan.id,
    })

    const user = await ensureBillingUser(params.userId, params.cpfCnpj)
    const split = await SplitService.buildSplitPayload()
    const description = buildCheckoutDescription(plan.id, 'subscription')

    const asaasSubscription = await AsaasClient.post<{ id: string }>('/subscriptions/', {
      customer: user.asaasCustomerId,
      billingType: 'CREDIT_CARD',
      cycle: plan.cycle,
      value: plan.creditCardAmount,
      nextDueDate: todayDateString(),
      description,
      split,
      externalReference: params.userId,
      remoteIp: params.remoteIp,
      creditCard: params.creditCard,
      creditCardHolderInfo: buildCreditCardHolderInfo(user, params.cpfCnpj),
    })

    const firstPayment = (await listSubscriptionPayments(asaasSubscription.id))[0]
    if (!firstPayment) {
      throw new Error('Asaas failed to generate the first payment for the subscription')
    }

    const subscription = await upsertCheckoutSubscription({
      userId: params.userId,
      offerId: plan.creditCardOfferId,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      asaasId: asaasSubscription.id,
    })
    const invoice = await upsertInvoice({
      userId: params.userId,
      subscriptionId: subscription.id,
      offerId: plan.creditCardOfferId,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      payment: firstPayment,
    })

    if (isPaidStatus(invoice.status)) {
      const paidAt = new Date(firstPayment.paymentDate ?? firstPayment.confirmedDate ?? Date.now())
      await activateSubscription(subscription.id, plan.id, paidAt, { billingMode: 'subscription' })
    }

    await BillingAuditService.log({
      userId: params.userId,
      actor: AuditActor.USER,
      action: 'CHECKOUT_CREDIT_CARD_INITIATED',
      entity: 'Invoice',
      entityId: invoice.id,
      metadata: {
        asaasSubId: asaasSubscription.id,
        invoiceAsaasId: firstPayment.id,
        planId: plan.id,
        amount: plan.creditCardAmount,
        installments: 1,
      },
    })

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      status: invoice.status,
    }
  }

  private static async createAnnualCreditCardPayment(params: {
    userId: string
    cpfCnpj: string
    planId: CheckoutPlanId
    remoteIp?: string
    creditCard: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    }
  }) {
    const plan = await BillingCatalogService.getCheckoutPlan(params.planId)
    billingLog('info', 'Starting annual credit card payment', {
      userId: params.userId,
      planId: plan.id,
      installments: 1,
    })

    const user = await ensureBillingUser(params.userId, params.cpfCnpj)
    const split = await SplitService.buildSplitPayload()
    const description = buildCheckoutDescription(plan.id, 'single')

    const payment = await AsaasClient.post<AsaasPayment>('/payments/', {
      customer: user.asaasCustomerId,
      billingType: 'CREDIT_CARD',
      value: plan.creditCardAmount,
      dueDate: todayDateString(),
      description,
      split,
      externalReference: params.userId,
      remoteIp: params.remoteIp,
      creditCard: params.creditCard,
      creditCardHolderInfo: buildCreditCardHolderInfo(user, params.cpfCnpj),
    })

    const subscription = await upsertCheckoutSubscription({
      userId: params.userId,
      offerId: plan.creditCardOfferId,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      asaasId: payment.id,
    })
    const invoice = await upsertInvoice({
      userId: params.userId,
      subscriptionId: subscription.id,
      offerId: plan.creditCardOfferId,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      payment,
    })

    if (isPaidStatus(invoice.status)) {
      const paidAt = new Date(payment.paymentDate ?? payment.confirmedDate ?? Date.now())
      await activateSubscription(subscription.id, plan.id, paidAt, { billingMode: 'single' })
    }

    await BillingAuditService.log({
      userId: params.userId,
      actor: AuditActor.USER,
      action: 'CHECKOUT_CREDIT_CARD_INITIATED',
      entity: 'Invoice',
      entityId: invoice.id,
      metadata: {
        invoiceAsaasId: payment.id,
        planId: plan.id,
        amount: plan.creditCardAmount,
        installments: 1,
      },
    })

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      status: invoice.status,
    }
  }

  private static async createAnnualCreditCardInstallment(params: {
    userId: string
    cpfCnpj: string
    planId: CheckoutPlanId
    installments: number
    remoteIp?: string
    creditCard: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    }
  }) {
    const catalog = await BillingCatalogService.getCheckoutCatalog()
    const plan = catalog[params.planId]
    const annualInstallment = getAnnualCardInstallment(plan.id, params.installments, catalog)

    if (!annualInstallment || annualInstallment.count <= 1) {
      throw new Error('Parcelamento anual inválido')
    }

    billingLog('info', 'Starting annual credit card installment checkout', {
      userId: params.userId,
      planId: plan.id,
      installments: annualInstallment.count,
    })

    const user = await ensureBillingUser(params.userId, params.cpfCnpj)
    const split = await SplitService.buildSplitPayload()
    const description = buildCheckoutDescription(plan.id, 'installment')

    const installment = await AsaasClient.post<AsaasInstallment>('/installments/', {
      installmentCount: annualInstallment.count,
      customer: user.asaasCustomerId,
      value: annualInstallment.installmentValue,
      totalValue: annualInstallment.totalValue,
      billingType: 'CREDIT_CARD',
      dueDate: todayDateString(),
      description,
      splits: split,
      paymentExternalReference: params.userId,
      remoteIp: params.remoteIp,
      creditCard: params.creditCard,
      creditCardHolderInfo: buildCreditCardHolderInfo(user, params.cpfCnpj),
    })

    const firstPayment = (await listInstallmentPayments(installment.id))[0]
    if (!firstPayment) {
      throw new Error('Asaas failed to generate the first payment for the installment')
    }

    const subscription = await upsertCheckoutSubscription({
      userId: params.userId,
      offerId: plan.creditCardOfferId,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      asaasId: installment.id,
    })
    const invoice = await upsertInvoice({
      userId: params.userId,
      subscriptionId: subscription.id,
      offerId: plan.creditCardOfferId,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      payment: firstPayment,
    })

    if (isPaidStatus(invoice.status)) {
      const paidAt = new Date(firstPayment.paymentDate ?? firstPayment.confirmedDate ?? Date.now())
      await activateSubscription(subscription.id, plan.id, paidAt, { billingMode: 'installment' })
    }

    const anticipation = annualInstallment.requiresAnticipation
      ? await requestInstallmentAnticipation(installment.id)
      : null

    await BillingAuditService.log({
      userId: params.userId,
      actor: AuditActor.USER,
      action: 'CHECKOUT_CREDIT_CARD_INITIATED',
      entity: 'Invoice',
      entityId: invoice.id,
      metadata: {
        asaasInstallmentId: installment.id,
        invoiceAsaasId: firstPayment.id,
        anticipationId: anticipation?.id,
        anticipationStatus: anticipation?.status,
        planId: plan.id,
        amount: annualInstallment.totalValue,
        installmentValue: annualInstallment.installmentValue,
        installments: annualInstallment.count,
      },
    })

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      status: invoice.status,
    }
  }

  static async getInvoiceStatusForUser(invoiceId: string, userId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      select: { status: true, asaasId: true },
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    return invoice
  }

  static async getInvoiceStatusById(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { status: true, asaasId: true },
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    return invoice
  }

  static async inferPlanIdFromPayment(description?: string | null, value?: number) {
    return inferPlanId(description, value)
  }

  static async activateSubscriptionForPayment(
    subscriptionId: string,
    description?: string | null,
    value?: number,
    paidAt = new Date(),
  ) {
    const planId = await inferPlanId(description, value)
    const billingMode = extractCheckoutBillingMode(description)
    await activateSubscription(subscriptionId, planId, paidAt, { billingMode })
  }
}
