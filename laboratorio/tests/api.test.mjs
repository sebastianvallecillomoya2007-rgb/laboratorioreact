import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { createApi } from '../server/api.mjs'

test('API: lectura dinámica, JSON roto, recuperación y rutas de error', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nexus-api-test-'))
  const dbPath = join(directory, 'db.json')
  const api = createApi(dbPath)
  await new Promise(r => api.listen(0, '127.0.0.1', r))
  const base = 'http://127.0.0.1:' + api.address().port
  try {
    await writeFile(dbPath, JSON.stringify({ products: [{ id: 'first' }] }))
    const response = await fetch(base + '/api/products')
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), [{ id: 'first' }])
    await writeFile(dbPath, JSON.stringify({ products: [{ id: 'changed' }] }))
    assert.deepEqual(await (await fetch(base + '/api/products')).json(), [{ id: 'changed' }])
    await writeFile(dbPath, '{broken')
    assert.equal((await fetch(base + '/api/products')).status, 500)
    await writeFile(dbPath, JSON.stringify({ products: [] }))
    assert.deepEqual(await (await fetch(base + '/api/products')).json(), [])
    assert.equal((await fetch(base + '/api/demo-error')).status, 503)
    assert.equal((await fetch(base + '/missing')).status, 404)
    assert.equal((await fetch(base + '/api/products', { method: 'POST' })).status, 405)
  } finally {
    await new Promise(r => api.close(r))
    // Eliminar únicamente el directorio temporal creado por esta prueba.
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'nexus-api-test-'))
    await rm(directory, { recursive: true, force: true })
  }
})
