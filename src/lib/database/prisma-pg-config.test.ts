import test from 'node:test'
import assert from 'node:assert/strict'
import { createPrismaPgPoolConfig } from './prisma-pg-config'

test('createPrismaPgPoolConfig returns a plain PoolConfig with the connection string', () => {
  assert.deepEqual(createPrismaPgPoolConfig('postgres://example-db'), {
    connectionString: 'postgres://example-db',
  })
})

test('createPrismaPgPoolConfig returns an empty PoolConfig when DATABASE_URL is missing', () => {
  assert.deepEqual(createPrismaPgPoolConfig(undefined), {})
})
