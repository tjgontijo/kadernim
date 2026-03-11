import { PaymentMethod } from '@db'

export const CHECKOUT_PLAN_NAME = 'Kadernim Pro'
export const CHECKOUT_PLAN_IDS = ['monthly', 'annual'] as const
export type CheckoutPlanId = (typeof CHECKOUT_PLAN_IDS)[number]
export type CheckoutUiMethod = 'PIX' | 'CREDIT_CARD'
export type CheckoutStatusTokenType = 'invoice' | 'authorization'
export type CheckoutBillingMode = 'pix-automatic' | 'subscription' | 'single' | 'installment'
export const ANNUAL_CARD_INSTALLMENT_RATE = 0.0349
export const MAX_ANNUAL_CARD_INSTALLMENTS = 12
export const MIN_ANNUAL_CARD_INSTALLMENTS = 1
export const DEFAULT_CHECKOUT_PLAN_ID: CheckoutPlanId = 'annual'

export type AnnualCardInstallmentOption = {
  count: number
  totalValue: number
  installmentValue: number
  priceLabel: string
  submitLabel: string
  description: string
  requiresAnticipation: boolean
}

export type CheckoutPlan = {
  id: CheckoutPlanId
  name: string
  label: string
  description: string
  cycle: 'MONTHLY' | 'YEARLY'
  badge?: string
  strikeLabel?: string
  accessDays: number
  pixOfferId: string
  pixPaymentMethod: 'PIX' | 'PIX_AUTOMATIC'
  pixAmount: number
  pixPriceLabel: string
  pixSubmitLabel: string
  pixDescription: string
  creditCardOfferId: string
  creditCardAmount: number
  creditCardPriceLabel: string
  creditCardSubmitLabel: string
  creditCardDescription: string
  creditCardInstallmentRate?: number
  creditCardMaxInstallments?: number
}

export type CheckoutPlanCatalog = Record<CheckoutPlanId, CheckoutPlan>

export function getCheckoutPlan(plans: CheckoutPlanCatalog, planId: string): CheckoutPlan {
  if (!(planId in plans)) {
    throw new Error('Plano inválido')
  }

  return plans[planId as CheckoutPlanId]
}

export function resolveCheckoutPaymentMethod(
  planId: CheckoutPlanId,
  method: CheckoutUiMethod,
  plans: CheckoutPlanCatalog,
) {
  if (method === 'CREDIT_CARD') {
    return PaymentMethod.CREDIT_CARD
  }

  return plans[planId].pixPaymentMethod
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function calculateInstallmentValue(principal: number, monthlyRate: number, installments: number) {
  if (installments <= 1) {
    return roundCurrency(principal)
  }

  const payment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -installments))
  return roundCurrency(payment)
}

export function getAnnualCardInstallmentOptions(planId: CheckoutPlanId, plans: CheckoutPlanCatalog) {
  if (planId !== 'annual') {
    return []
  }

  const plan = plans.annual
  const maxInstallments = plan.creditCardMaxInstallments ?? MAX_ANNUAL_CARD_INSTALLMENTS
  const monthlyRate = plan.creditCardInstallmentRate ?? ANNUAL_CARD_INSTALLMENT_RATE

  return Array.from({ length: maxInstallments }, (_, index) => {
    const count = index + 1
    const installmentValue = calculateInstallmentValue(plan.creditCardAmount, monthlyRate, count)
    const totalValue = roundCurrency(installmentValue * count)
    const priceLabel = `${count}x de ${formatCheckoutCurrency(installmentValue)}`

    return {
      count,
      totalValue,
      installmentValue,
      priceLabel,
      submitLabel: priceLabel,
      description: count === 1
        ? 'Cobrança única no cartão.'
        : 'Parcelamento no cartão de crédito.',
      requiresAnticipation: count > 1,
    } satisfies AnnualCardInstallmentOption
  })
}

export function getCheckoutPricing(
  planId: CheckoutPlanId,
  method: CheckoutUiMethod,
  plans: CheckoutPlanCatalog,
  installments: number = 1,
) {
  const plan = plans[planId]

  if (method === 'PIX') {
    return {
      amount: plan.pixAmount,
      priceLabel: plan.pixPriceLabel,
      submitLabel: plan.pixSubmitLabel,
    }
  }

  if (planId === 'annual') {
    const annualInstallment = getAnnualCardInstallment(planId, installments, plans)
    if (annualInstallment) {
      return {
        amount: annualInstallment.totalValue,
        priceLabel: annualInstallment.priceLabel,
        submitLabel: annualInstallment.submitLabel,
      }
    }
  }

  return {
    amount: plan.creditCardAmount,
    priceLabel: plan.creditCardPriceLabel,
    submitLabel: plan.creditCardSubmitLabel,
  }
}

export function getAnnualCardInstallment(
  planId: CheckoutPlanId,
  installments: number,
  plans: CheckoutPlanCatalog,
) {
  if (planId !== 'annual') {
    return null
  }

  return getAnnualCardInstallmentOptions(planId, plans).find((option) => option.count === installments) ?? null
}

export function getAnnualCardInstallmentPreview(planId: CheckoutPlanId, plans: CheckoutPlanCatalog) {
  return getAnnualCardInstallment(planId, MAX_ANNUAL_CARD_INSTALLMENTS, plans)
}

export function buildCheckoutDescription(planId: CheckoutPlanId, billingMode?: CheckoutBillingMode) {
  const billingSuffix = billingMode ? `[billing:${billingMode}]` : ''
  return `${CHECKOUT_PLAN_NAME} [plan:${planId}]${billingSuffix}`
}

export function extractCheckoutPlanId(description?: string | null): CheckoutPlanId | null {
  if (!description) {
    return null
  }

  const match = description.match(/\[plan:(monthly|annual)\]/)
  return (match?.[1] as CheckoutPlanId | undefined) ?? null
}

export function extractCheckoutBillingMode(description?: string | null): CheckoutBillingMode | null {
  if (!description) {
    return null
  }

  const match = description.match(/\[billing:(pix-automatic|subscription|single|installment)\]/)
  return (match?.[1] as CheckoutBillingMode | undefined) ?? null
}

export function formatCheckoutCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
