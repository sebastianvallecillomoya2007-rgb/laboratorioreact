import { spawn } from 'node:child_process'
import { createApi } from '../server/api.mjs'

const api = createApi()
api.on('error', error => { console.error(`No se pudo iniciar la API: ${error.message}. Libera el puerto 3001.`); process.exit(1) })
api.listen(3001, '127.0.0.1', () => {
  console.log('API NEXUS lista en http://127.0.0.1:3001')
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', ...process.argv.slice(2)], { stdio: 'inherit' })
  const shutdown = () => { vite.kill(); api.close(); }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  vite.on('exit', code => { api.close(); process.exitCode = code ?? 0 })
  vite.on('error', error => { console.error(error); shutdown(); process.exitCode = 1 })
})
