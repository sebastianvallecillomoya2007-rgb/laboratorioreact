import test from 'node:test'
import assert from 'node:assert/strict'
import { rankProducts, validateProducts } from '../src/lib/catalog.js'
const now = new Date('2026-09-11T12:00:00Z')
const product = (id, overrides = {}) => ({ id, name: 'GPU demo', description: 'Demo', category: 'Tarjetas gráficas', price: 100, stock: 2, rating: 4, releaseDate: '2026-09-01', ...overrides })

test('ranking filtra antiguos, futuros y agotados sin mutar el catálogo', () => {
  const rows = [product('old', { releaseDate: '2026-01-01', rating: 5 }), product('future', { releaseDate: '2026-09-12', rating: 5 }), product('empty', { stock: 0, rating: 5 }), product('valid')]
  assert.deepEqual(rankProducts(rows, now).map(p => p.id), ['valid'])
  assert.equal(rows.length, 4)
})
test('ranking usa valoración, fecha e ID como desempate y limita a tres', () => {
  const rows = [product('b'), product('a'), product('new', { releaseDate: '2026-09-10' }), product('best', { rating: 4.9 })]
  assert.deepEqual(rankProducts(rows, now).map(p => p.id), ['best', 'new', 'a'])
})
test('incluye hoy y exactamente 90 días; excluye 91 días', () => {
  const rows = [product('today', { releaseDate: '2026-09-11' }), product('edge', { releaseDate: '2026-06-13' }), product('outside', { releaseDate: '2026-06-12' })]
  assert.deepEqual(rankProducts(rows, now).map(p => p.id), ['today', 'edge'])
})
test('una lista vacía es válida y produce un ranking vacío', () => {
  assert.deepEqual(rankProducts(validateProducts([]), now), [])
})
test('rechaza datos incompletos, duplicados, fechas imposibles y números inválidos', () => {
  for (const data of [{}, [null], [product('a'), product('a')], [product('a', { price: -1 })], [product('a', { stock: 1.2 })], [product('a', { rating: 6 })], [product('a', { releaseDate: '2026-02-30' })], [product('a', { category: 'Otro' })]]) {
    assert.throws(() => validateProducts(data))
  }
  assert.equal(validateProducts([product('a')]).length, 1)
})
