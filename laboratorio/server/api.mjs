import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

export function createApi(dbPath = fileURLToPath(new URL('../db.json', import.meta.url))) {
  return createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    const send = (status, data) => { response.writeHead(status); response.end(JSON.stringify(data)) }
    if (request.method !== 'GET') return send(405, { error: 'Solo se permite GET.' })
    const pathname = new URL(request.url, 'http://localhost').pathname
    if (pathname === '/api/demo-error') return send(503, { error: 'Fallo temporal de demostración.' })
    if (pathname !== '/api/products') return send(404, { error: 'Ruta no encontrada.' })
    try {
      // Leer en cada consulta permite demostrar cambios sin reiniciar el servidor.
      const db = JSON.parse(await readFile(dbPath, 'utf8'))
      if (!Array.isArray(db.products)) throw new Error('products no es una lista')
      send(200, db.products)
    } catch {
      send(500, { error: 'No se pudo leer db.json. Revisa su contenido.' })
    }
  })
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.API_PORT || 3001)
  createApi().listen(port, '127.0.0.1', () => console.log(`API NEXUS: http://127.0.0.1:${port}/api/products`))
}
