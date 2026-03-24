import test from 'node:test'
import assert from 'node:assert/strict'
import {
  detectAsaasEnvironmentFromBaseUrl,
  getAsaasBaseUrl,
  normalizeAsaasEnvironment,
  DEFAULT_ASAAS_BASE_URL,
  normalizeAsaasBaseUrl,
  normalizeAsaasSecret,
} from './asaas-config'

test('normalizeAsaasSecret trims configured secrets', () => {
  assert.equal(
    normalizeAsaasSecret('  secret_123  '),
    'secret_123',
  )
})

test('normalizeAsaasSecret returns null for blank values', () => {
  assert.equal(normalizeAsaasSecret('   '), null)
  assert.equal(normalizeAsaasSecret(undefined), null)
})

test('normalizeAsaasBaseUrl trims and removes trailing slash', () => {
  assert.equal(
    normalizeAsaasBaseUrl(' https://api-sandbox.asaas.com/v3/ '),
    'https://api-sandbox.asaas.com/v3',
  )
})

test('normalizeAsaasBaseUrl falls back to the sandbox url', () => {
  assert.equal(normalizeAsaasBaseUrl(''), DEFAULT_ASAAS_BASE_URL)
})

test('normalizeAsaasEnvironment accepts supported environments', () => {
  assert.equal(normalizeAsaasEnvironment('sandbox'), 'sandbox')
  assert.equal(normalizeAsaasEnvironment('PRODUCTION'), 'production')
})

test('normalizeAsaasEnvironment rejects unsupported environments', () => {
  assert.equal(normalizeAsaasEnvironment('staging'), null)
})

test('getAsaasBaseUrl maps sandbox and production', () => {
  assert.equal(getAsaasBaseUrl('sandbox'), 'https://api-sandbox.asaas.com/v3')
  assert.equal(getAsaasBaseUrl('production'), 'https://api.asaas.com/v3')
})

test('detectAsaasEnvironmentFromBaseUrl falls back from legacy base urls', () => {
  assert.equal(
    detectAsaasEnvironmentFromBaseUrl('https://api.asaas.com/v3'),
    'production',
  )
  assert.equal(
    detectAsaasEnvironmentFromBaseUrl('https://sandbox.asaas.com/api/v3'),
    'sandbox',
  )
})
