import { prisma } from '@/lib/db'
import { PaymentMethod } from '@db'
import {
  CHECKOUT_PLAN_IDS,
  formatCheckoutCurrency,
  type CheckoutPlan,
  type CheckoutPlanCatalog,
  type CheckoutPlanId,
} from '@/lib/billing/checkout-offer'

const CACHE_TTL_MS = 5 * 60 * 1000

let catalogCache: { value: CheckoutPlanCatalog; expiresAt: number } | null = null

function toAmount(value: unknown) {
  return Number(value)
}

function formatStrikeLabel(value: number) {
  return `R$ ${Math.round(value)}`
}

function resolvePixCheckoutDescription(paymentMethod: PaymentMethod, cycle: 'MONTHLY' | 'YEARLY') {
  if (paymentMethod === PaymentMethod.PIX_AUTOMATIC) {
    return cycle === 'MONTHLY'
      ? 'PIX Automático com renovação mensal.'
      : 'PIX Automático.'
  }

  return cycle === 'MONTHLY'
    ? 'Pagamento mensal no PIX com renovação manual.'
    : 'Pagamento único no PIX.'
}

function buildPlan(input: {
  id: CheckoutPlanId
  name: string
  cycle: 'MONTHLY' | 'YEARLY'
  accessDays: number
  offers: Array<{
    id: string
    code: string
    paymentMethod: PaymentMethod
    amount: unknown
    maxInstallments: number
    installmentRate: unknown
  }>
}): CheckoutPlan {
  const creditCardOffer = input.offers.find((offer) => offer.paymentMethod === PaymentMethod.CREDIT_CARD)
  const pixOffer = input.offers.find((offer) => (
    offer.paymentMethod === PaymentMethod.PIX || offer.paymentMethod === PaymentMethod.PIX_AUTOMATIC
  ))

  if (!creditCardOffer || !pixOffer) {
    throw new Error(`Plano ${input.id} sem ofertas ativas suficientes para checkout`)
  }

  const pixAmount = toAmount(pixOffer.amount)
  const creditCardAmount = toAmount(creditCardOffer.amount)
  const installmentRate = creditCardOffer.installmentRate == null
    ? undefined
    : Number(creditCardOffer.installmentRate)

  if (input.id === 'monthly') {
    const monthlyPixPaymentMethod = pixOffer.paymentMethod === PaymentMethod.PIX_AUTOMATIC
      ? PaymentMethod.PIX_AUTOMATIC
      : PaymentMethod.PIX

    return {
      id: input.id,
      name: input.name,
      label: 'Mensal',
      description: 'Cancele quando quiser',
      cycle: input.cycle,
      accessDays: input.accessDays,
      pixOfferId: pixOffer.id,
      pixPaymentMethod: monthlyPixPaymentMethod,
      pixAmount,
      pixPriceLabel: `${formatCheckoutCurrency(pixAmount)}/mês`,
      pixSubmitLabel: `${formatCheckoutCurrency(pixAmount)}/mês`,
      pixDescription: resolvePixCheckoutDescription(monthlyPixPaymentMethod, input.cycle),
      creditCardOfferId: creditCardOffer.id,
      creditCardAmount,
      creditCardPriceLabel: `${formatCheckoutCurrency(creditCardAmount)}/mês`,
      creditCardSubmitLabel: `${formatCheckoutCurrency(creditCardAmount)}/mês`,
      creditCardDescription: 'Cobrança mensal no cartão de crédito.',
      creditCardMaxInstallments: 1,
    }
  }

  return {
    id: input.id,
    name: input.name,
    label: 'Anual',
    description: `${formatCheckoutCurrency(pixAmount)} à vista ou parcelado no cartão`,
    cycle: input.cycle,
    badge: '2 MESES GRÁTIS',
    accessDays: input.accessDays,
    pixOfferId: pixOffer.id,
    pixPaymentMethod: PaymentMethod.PIX,
    pixAmount,
    pixPriceLabel: `${formatCheckoutCurrency(pixAmount)} à vista`,
    pixSubmitLabel: `${formatCheckoutCurrency(pixAmount)} à vista`,
    pixDescription: resolvePixCheckoutDescription(PaymentMethod.PIX, input.cycle),
    creditCardOfferId: creditCardOffer.id,
    creditCardAmount,
    creditCardPriceLabel: `1x de ${formatCheckoutCurrency(creditCardAmount)}`,
    creditCardSubmitLabel: `1x de ${formatCheckoutCurrency(creditCardAmount)}`,
    creditCardDescription: installmentRate
      ? `Parcelamento com taxa de ${(installmentRate * 100).toFixed(2).replace('.', ',')}% a.m. no estilo Hotmart/Kiwify.`
      : 'Cobrança anual no cartão de crédito.',
    creditCardInstallmentRate: installmentRate,
    creditCardMaxInstallments: creditCardOffer.maxInstallments,
  }
}

export class BillingCatalogService {
  static async getCheckoutCatalog(forceRefresh = false) {
    if (!forceRefresh && catalogCache && catalogCache.expiresAt > Date.now()) {
      return catalogCache.value
    }

    const now = new Date()
    const plans = await prisma.billingPlan.findMany({
      where: {
        isActive: true,
        code: {
          in: [...CHECKOUT_PLAN_IDS],
        },
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        cycle: true,
        accessDays: true,
      },
    })

    const offers = await prisma.billingOffer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gt: now } },
        ],
        plan: {
          code: {
            in: [...CHECKOUT_PLAN_IDS],
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        planId: true,
        paymentMethod: true,
        amount: true,
        maxInstallments: true,
        installmentRate: true,
      },
    })

    const monthly = plans.find((plan) => plan.code === 'monthly')
    const annual = plans.find((plan) => plan.code === 'annual')

    if (!monthly || !annual) {
      throw new Error('Catálogo de billing incompleto: planos mensal e anual são obrigatórios')
    }

    const catalog = {
      monthly: buildPlan({
        id: 'monthly',
        name: monthly.name,
        cycle: monthly.cycle,
        accessDays: monthly.accessDays,
        offers: offers.filter((offer) => offer.planId === monthly.id),
      }),
      annual: buildPlan({
        id: 'annual',
        name: annual.name,
        cycle: annual.cycle,
        accessDays: annual.accessDays,
        offers: offers.filter((offer) => offer.planId === annual.id),
      }),
    } satisfies CheckoutPlanCatalog

    catalog.annual.strikeLabel = formatStrikeLabel(catalog.monthly.creditCardAmount * 12)

    catalogCache = {
      value: catalog,
      expiresAt: Date.now() + CACHE_TTL_MS,
    }

    return catalog
  }

  static async getCheckoutPlan(planId: CheckoutPlanId) {
    const catalog = await this.getCheckoutCatalog()
    return catalog[planId]
  }

  static async inferPlanIdFromAmount(value?: number | null) {
    if (typeof value !== 'number') {
      return 'annual' as CheckoutPlanId
    }

    const catalog = await this.getCheckoutCatalog()
    if (Math.abs(value - catalog.monthly.pixAmount) < 0.01) {
      return 'monthly' as CheckoutPlanId
    }

    return 'annual' as CheckoutPlanId
  }

  static clearCache() {
    catalogCache = null
  }
}
