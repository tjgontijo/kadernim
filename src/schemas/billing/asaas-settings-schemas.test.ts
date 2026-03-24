import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BillingAsaasSettingsSchema,
  BillingAsaasSettingsUpdateSchema,
} from './asaas-settings-schemas'

test('BillingAsaasSettingsSchema accepts admin status payload', () => {
  const parsed = BillingAsaasSettingsSchema.safeParse({
    environment: 'sandbox',
    hasApiKey: true,
    hasWebhookToken: false,
  })

  assert.equal(parsed.success, true)
})

test('BillingAsaasSettingsUpdateSchema accepts blank secret updates', () => {
  const parsed = BillingAsaasSettingsUpdateSchema.safeParse({
    environment: 'production',
    apiKey: '',
    webhookToken: '',
  })

  assert.equal(parsed.success, true)
})

test('BillingAsaasSettingsUpdateSchema rejects invalid environments', () => {
  const parsed = BillingAsaasSettingsUpdateSchema.safeParse({
    environment: 'staging',
    apiKey: 'secret',
  })

  assert.equal(parsed.success, false)
})
