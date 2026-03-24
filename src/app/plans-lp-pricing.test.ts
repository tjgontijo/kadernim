import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

test('plans2 LP displays the current monthly and annual prices', () => {
  const source = read('./plans2/page.tsx')

  assert.match(source, /R\$\s*&nbsp;27\/mês/)
  assert.match(source, /R\$ 27\/mês/)
  assert.match(source, /R\$ 197\/ano/)
  assert.doesNotMatch(source, /—/)
  assert.doesNotMatch(source, /R\$\s*&nbsp;29\/mês/)
  assert.doesNotMatch(source, /R\$ 29\/mês/)
  assert.doesNotMatch(source, /R\$ 199\/ano/)
})

test('plans3 LP displays the current monthly and annual prices', () => {
  const source = read('./plans3/page.tsx')

  assert.match(source, /R\$\s*&nbsp;27\/mês/)
  assert.match(source, /R\$ 27\/mês/)
  assert.match(source, /R\$ 197\/ano/)
  assert.doesNotMatch(source, /—/)
  assert.doesNotMatch(source, /R\$\s*&nbsp;29\/mês/)
  assert.doesNotMatch(source, /R\$ 29\/mês/)
  assert.doesNotMatch(source, /R\$ 199\/ano/)
})

test('shared pricing component for /plans keeps the annual LP price aligned', () => {
  const source = read('../components/home/Pricing.tsx')

  assert.match(source, /R\$ 197,00/)
  assert.doesNotMatch(source, /R\$ 199,00/)
})
