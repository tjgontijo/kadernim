import { z } from 'zod'
import { PaymentMethod } from '@db'
import {
  CHECKOUT_PLAN_IDS,
  DEFAULT_CHECKOUT_PLAN_ID,
  MAX_ANNUAL_CARD_INSTALLMENTS,
  MIN_ANNUAL_CARD_INSTALLMENTS,
} from '@/lib/billing/checkout-offer'

function isValidCpfCnpj(value: string) {
  const clean = value.replace(/\D/g, '')
  return clean.length === 11 || clean.length === 14
}

const CheckoutCreditCardSchema = z.object({
  holderName: z.string().min(3, 'Nome no cartão inválido').optional(),
  number: z.string().min(14, 'Número do cartão inválido').optional(),
  expiryMonth: z.string().min(2, 'Mês inválido').optional(),
  expiryYear: z.string().min(4, 'Ano inválido').optional(),
  ccv: z.string().min(3, 'CCV inválido').optional(),
})

const CheckoutPlanIdSchema = z.enum(CHECKOUT_PLAN_IDS)

export const CheckoutRequestSchema = z.object({
  cpfCnpj: z.string().refine(isValidCpfCnpj, {
    message: 'CPF ou CNPJ inválido',
  }),
  paymentMethod: z.enum([
    PaymentMethod.PIX,
    PaymentMethod.PIX_AUTOMATIC,
    PaymentMethod.CREDIT_CARD,
  ], {
    message: 'Método de pagamento inválido',
  }),
  creditCard: CheckoutCreditCardSchema.optional(),
  creditCardToken: z.string().optional(),
  planId: CheckoutPlanIdSchema.default(DEFAULT_CHECKOUT_PLAN_ID),
  installments: z.number().int().min(1).max(MAX_ANNUAL_CARD_INSTALLMENTS).default(1),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === PaymentMethod.CREDIT_CARD) {
    const hasRawData = Boolean(
      data.creditCard?.holderName
      && data.creditCard?.number
      && data.creditCard?.expiryMonth
      && data.creditCard?.expiryYear
      && data.creditCard?.ccv,
    )

    if (!hasRawData && !data.creditCardToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['creditCard'],
        message: 'Dados do cartão de crédito obrigatórios',
      })
    }
  }

  if (data.planId === 'monthly' && data.paymentMethod === PaymentMethod.CREDIT_CARD && data.installments !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['installments'],
      message: 'Plano mensal aceita apenas cobrança única recorrente no cartão',
    })
  }

  if (data.planId === 'annual' && data.paymentMethod === PaymentMethod.CREDIT_CARD) {
    if (data.installments < MIN_ANNUAL_CARD_INSTALLMENTS || data.installments > MAX_ANNUAL_CARD_INSTALLMENTS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installments'],
        message: `Plano anual aceita parcelamento entre ${MIN_ANNUAL_CARD_INSTALLMENTS}x e ${MAX_ANNUAL_CARD_INSTALLMENTS}x no cartão`,
      })
    }
  }

  if (data.paymentMethod !== PaymentMethod.CREDIT_CARD && data.installments !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['installments'],
      message: 'Parcelamento só pode ser informado para cartão de crédito',
    })
  }
})

export const GuestCheckoutRequestSchema = CheckoutRequestSchema.safeExtend({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome obrigatório').optional(),
  phone: z.string().optional(),
})

export const CheckoutLookupQuerySchema = z.object({
  email: z.string().email('Email inválido'),
})

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>
export type GuestCheckoutRequest = z.infer<typeof GuestCheckoutRequestSchema>
export type CheckoutLookupQuery = z.infer<typeof CheckoutLookupQuerySchema>
