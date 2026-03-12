import test from 'node:test'
import assert from 'node:assert/strict'
import { SplitType } from '@db'
import {
  buildAsaasSplitPayload,
  isSameWalletId,
  normalizeWalletId,
} from './split-payload'

test('normalizeWalletId trims and normalizes wallet ids', () => {
  assert.equal(
    normalizeWalletId(' F758BFB5-231D-42BB-9FC6-547B6D394E33 '),
    'f758bfb5-231d-42bb-9fc6-547b6d394e33',
  )
})

test('isSameWalletId matches the configured main wallet', () => {
  assert.equal(
    isSameWalletId(
      'f758bfb5-231d-42bb-9fc6-547b6d394e33',
      ' F758BFB5-231D-42BB-9FC6-547B6D394E33 ',
    ),
    true,
  )
})

test('buildAsaasSplitPayload skips self split wallet', () => {
  const payload = buildAsaasSplitPayload({
    companyName: 'Elev8',
    walletId: 'f758bfb5-231d-42bb-9fc6-547b6d394e33',
    isActive: true,
    splitType: SplitType.PERCENTAGE,
    percentualValue: 100,
    description: 'Split parceiro',
  }, 'f758bfb5-231d-42bb-9fc6-547b6d394e33')

  assert.equal(payload, undefined)
})

test('buildAsaasSplitPayload returns partner split payload', () => {
  const payload = buildAsaasSplitPayload({
    companyName: 'Elev8',
    walletId: '8cc8a8f2-3d30-4e64-9f85-55b514ce6f70',
    isActive: true,
    splitType: SplitType.PERCENTAGE,
    percentualValue: 35,
    description: '',
  }, 'f758bfb5-231d-42bb-9fc6-547b6d394e33')

  assert.deepEqual(payload, [{
    walletId: '8cc8a8f2-3d30-4e64-9f85-55b514ce6f70',
    percentualValue: 35,
    description: 'Split para Elev8',
  }])
})
