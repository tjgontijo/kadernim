import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ANNUAL_CARD_INSTALLMENT_RATE,
  MAX_ANNUAL_CARD_INSTALLMENTS,
  getAnnualCardInstallment,
  getAnnualCardInstallmentOptions,
  getCheckoutPricing,
} from './checkout-offer'

test('annual installment options cover 1x to 12x with 3.49% a.m.', () => {
  const options = getAnnualCardInstallmentOptions('annual')

  assert.equal(options.length, MAX_ANNUAL_CARD_INSTALLMENTS)
  assert.equal(options[0]?.count, 1)
  assert.equal(options.at(-1)?.count, 12)
  assert.equal(ANNUAL_CARD_INSTALLMENT_RATE, 0.0349)
})

test('annual 1x remains 199 on credit card', () => {
  const option = getAnnualCardInstallment('annual', 1)
  assert.ok(option)
  assert.equal(option.installmentValue, 199)
  assert.equal(option.totalValue, 199)

  const pricing = getCheckoutPricing('annual', 'CREDIT_CARD', 1)
  assert.equal(pricing.amount, 199)
  assert.equal(pricing.priceLabel, '1x de R$ 199,00')
})

test('annual 12x applies the configured monthly rate to the customer', () => {
  const option = getAnnualCardInstallment('annual', 12)
  assert.ok(option)
  assert.equal(option.installmentValue, 20.58)
  assert.equal(option.totalValue, 246.96)
  assert.equal(option.requiresAnticipation, true)

  const pricing = getCheckoutPricing('annual', 'CREDIT_CARD', 12)
  assert.equal(pricing.amount, 246.96)
  assert.equal(pricing.priceLabel, '12x de R$ 20,58')
})
