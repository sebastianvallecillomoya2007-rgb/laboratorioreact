import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const profile = await mkdtemp(join(tmpdir(), 'nexus-report-'))
try {
  const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + profile, '--no-pdf-header-footer', '--print-to-pdf=' + resolve('docs/informe.pdf'), pathToFileURL(resolve('docs/informe.html')).href], { windowsHide: true, stdio: 'ignore' })
  const code = await new Promise((resolve, reject) => { chrome.on('exit', resolve); chrome.on('error', reject) })
  if (code !== 0) throw new Error('Chrome no pudo exportar el informe.')
  console.log('Generado: docs/informe.pdf. Completa tus datos en el HTML y vuelve a exportar antes de entregar.')
} finally {
  if (resolve(profile).startsWith(resolve(tmpdir()) + sep + 'nexus-report-')) await rm(profile, { recursive: true, force: true, maxRetries: 3 }).catch(() => {})
}
