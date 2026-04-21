import test from 'node:test'
import assert from 'node:assert/strict'
import { PaymentMethod, SplitType } from '@db'
import { CheckoutRequestSchema } from './payment-schemas'
import { SplitUpdateSchema } from './split-schemas'

test('CheckoutRequestSchema accepts masked cpf', () => {
  const parsed = CheckoutRequestSchema.safeParse({
    cpfCnpj: '529.982.247-25',
    paymentMethod: PaymentMethod.PIX,
    planId: 'annual',
    installments: 1,
  })

  assert.equal(parsed.success, true)
})

test('CheckoutRequestSchema rejects cpf with invalid check digits', () => {
  const parsed = CheckoutRequestSchema.safeParse({
    cpfCnpj: '529.982.247-24',
    paymentMethod: PaymentMethod.PIX,
    planId: 'annual',
    installments: 1,
  })

  assert.equal(parsed.success, false)
})

test('CheckoutRequestSchema rejects cnpj input', () => {
  const parsed = CheckoutRequestSchema.safeParse({
    cpfCnpj: '04.252.011/0001-10',
    paymentMethod: PaymentMethod.PIX,
    planId: 'annual',
    installments: 1,
  })

  assert.equal(parsed.success, false)
})

test('SplitUpdateSchema accepts valid masked cnpj', () => {
  const parsed = SplitUpdateSchema.safeParse({
    companyName: 'Elev8',
    cnpj: '04.252.011/0001-10',
    walletId: '8cc8a8f2-3d30-4e64-9f85-55b514ce6f70',
    splitType: SplitType.PERCENTAGE,
    percentualValue: 35,
  })

  assert.equal(parsed.success, true)
})

test('SplitUpdateSchema rejects invalid cnpj', () => {
  const parsed = SplitUpdateSchema.safeParse({
    companyName: 'Elev8',
    cnpj: '04.252.011/0001-11',
    walletId: '8cc8a8f2-3d30-4e64-9f85-55b514ce6f70',
    splitType: SplitType.PERCENTAGE,
    percentualValue: 35,
  })

  assert.equal(parsed.success, false)
})
