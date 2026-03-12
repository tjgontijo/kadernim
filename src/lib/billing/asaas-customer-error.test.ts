import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldRecreateDeletedAsaasCustomer } from './asaas-customer-error'

test('should recreate deleted asaas customer on 404', () => {
  assert.equal(
    shouldRecreateDeletedAsaasCustomer('Asaas API Error [404]: Customer not found'),
    true,
  )
})

test('should recreate deleted asaas customer on invalid_object deleted customer', () => {
  assert.equal(
    shouldRecreateDeletedAsaasCustomer(
      'Asaas API Error [400]: invalid_object: O cliente [165689346] não pode ser atualizado: Cliente excluído, não é possível fazer alterações.',
    ),
    true,
  )
})

test('should not recreate customer for unrelated invalid_object errors', () => {
  assert.equal(
    shouldRecreateDeletedAsaasCustomer(
      'Asaas API Error [400]: invalid_object: CPF/CNPJ inválido para o cliente informado.',
    ),
    false,
  )
})
