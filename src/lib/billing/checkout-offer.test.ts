import test from 'node:test'
import assert from 'node:assert/strict'
import { PaymentMethod } from '@db'
import {
  ANNUAL_CARD_INSTALLMENT_RATE,
  MAX_ANNUAL_CARD_INSTALLMENTS,
  getAnnualCardInstallment,
  getAnnualCardInstallmentOptions,
  getCheckoutPricing,
  resolveCheckoutPaymentMethod,
  type CheckoutPlanCatalog,
} from './checkout-offer'

const catalog: CheckoutPlanCatalog = {
  monthly: {
    id: 'monthly',
    name: 'Kadernim Pro Mensal',
    label: 'Mensal',
    description: 'Cancele quando quiser',
    cycle: 'MONTHLY',
    accessDays: 30,
    pixOfferId: 'offer_monthly_pix_default',
    pixPaymentMethod: PaymentMethod.PIX,
    pixAmount: 27,
    pixPriceLabel: 'R$ 27,00/mês',
    pixSubmitLabel: 'R$ 27,00/mês',
    pixDescription: 'Pagamento mensal no PIX com renovação manual.',
    creditCardOfferId: 'offer_monthly_credit_card_default',
    creditCardAmount: 27,
    creditCardPriceLabel: 'R$ 27,00/mês',
    creditCardSubmitLabel: 'R$ 27,00/mês',
    creditCardDescription: 'Cobrança mensal no cartão de crédito.',
    creditCardMaxInstallments: 1,
  },
  annual: {
    id: 'annual',
    name: 'Kadernim Pro Anual',
    label: 'Anual',
    description: 'R$ 197,00 à vista ou parcelado no cartão',
    cycle: 'YEARLY',
    badge: '2 MESES GRÁTIS',
    strikeLabel: 'R$ 324',
    accessDays: 365,
    pixOfferId: 'offer_annual_pix_default',
    pixPaymentMethod: PaymentMethod.PIX,
    pixAmount: 197,
    pixPriceLabel: 'R$ 197,00 à vista',
    pixSubmitLabel: 'R$ 197,00 à vista',
    pixDescription: 'Pagamento anual único no PIX.',
    creditCardOfferId: 'offer_annual_credit_card_default',
    creditCardAmount: 197,
    creditCardPriceLabel: '1x de R$ 197,00',
    creditCardSubmitLabel: '1x de R$ 197,00',
    creditCardDescription: 'Parcelamento com taxa de 3,49% a.m. no estilo Hotmart/Kiwify.',
    creditCardInstallmentRate: ANNUAL_CARD_INSTALLMENT_RATE,
    creditCardMaxInstallments: MAX_ANNUAL_CARD_INSTALLMENTS,
  },
}

test('annual installment options cover 1x to 12x with 3.49% a.m.', () => {
  const options = getAnnualCardInstallmentOptions('annual', catalog)

  assert.equal(options.length, MAX_ANNUAL_CARD_INSTALLMENTS)
  assert.equal(options[0]?.count, 1)
  assert.equal(options.at(-1)?.count, 12)
  assert.equal(ANNUAL_CARD_INSTALLMENT_RATE, 0.0349)
})

test('annual 1x remains 197 on credit card', () => {
  const option = getAnnualCardInstallment('annual', 1, catalog)
  assert.ok(option)
  assert.equal(option.installmentValue, 197)
  assert.equal(option.totalValue, 197)

  const pricing = getCheckoutPricing('annual', 'CREDIT_CARD', catalog, 1)
  assert.equal(pricing.amount, 197)
  assert.equal(pricing.priceLabel, '1x de R$ 197,00')
})

test('annual 12x applies the configured monthly rate to the customer', () => {
  const option = getAnnualCardInstallment('annual', 12, catalog)
  assert.ok(option)
  assert.equal(option.installmentValue, 20.37)
  assert.equal(option.totalValue, 244.44)
  assert.equal(option.requiresAnticipation, true)

  const pricing = getCheckoutPricing('annual', 'CREDIT_CARD', catalog, 12)
  assert.equal(pricing.amount, 244.44)
  assert.equal(pricing.priceLabel, '12x de R$ 20,37')
})

test('monthly PIX selection resolves to the configured pix method', () => {
  assert.equal(resolveCheckoutPaymentMethod('monthly', 'PIX', catalog), PaymentMethod.PIX)
  assert.equal(resolveCheckoutPaymentMethod('annual', 'PIX', catalog), PaymentMethod.PIX)
})
