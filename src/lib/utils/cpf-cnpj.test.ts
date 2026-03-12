import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyCnpjMask,
  applyCpfCnpjMask,
  applyCpfMask,
  isValidCnpj,
  isValidCpf,
  isValidCpfCnpj,
  normalizeCpfCnpj,
} from './cpf-cnpj'

test('normalizeCpfCnpj removes non-digit characters', () => {
  assert.equal(normalizeCpfCnpj('529.982.247-25'), '52998224725')
  assert.equal(normalizeCpfCnpj('04.252.011/0001-10'), '04252011000110')
})

test('applyCpfMask formats partial cpf input', () => {
  assert.equal(applyCpfMask('52998224725'), '529.982.247-25')
  assert.equal(applyCpfMask('5299822'), '529.982.2')
})

test('applyCnpjMask formats partial cnpj input', () => {
  assert.equal(applyCnpjMask('04252011000110'), '04.252.011/0001-10')
  assert.equal(applyCnpjMask('04252011'), '04.252.011')
})

test('applyCpfCnpjMask switches between cpf and cnpj formats', () => {
  assert.equal(applyCpfCnpjMask('52998224725'), '529.982.247-25')
  assert.equal(applyCpfCnpjMask('04252011000110'), '04.252.011/0001-10')
})

test('isValidCpf accepts valid cpf and rejects invalid cpf', () => {
  assert.equal(isValidCpf('529.982.247-25'), true)
  assert.equal(isValidCpf('111.111.111-11'), false)
  assert.equal(isValidCpf('529.982.247-24'), false)
})

test('isValidCnpj accepts valid cnpj and rejects invalid cnpj', () => {
  assert.equal(isValidCnpj('04.252.011/0001-10'), true)
  assert.equal(isValidCnpj('11.111.111/1111-11'), false)
  assert.equal(isValidCnpj('04.252.011/0001-11'), false)
})

test('isValidCpfCnpj validates both document types', () => {
  assert.equal(isValidCpfCnpj('529.982.247-25'), true)
  assert.equal(isValidCpfCnpj('04.252.011/0001-10'), true)
  assert.equal(isValidCpfCnpj('123'), false)
})
