import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join, sep } from 'node:path'
import assert from 'node:assert/strict'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const profile = await mkdtemp(join(tmpdir(), 'nexus-browser-test-'))
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9337', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
chrome.stderr.on('data', data => process.stderr.write(data))
let socket
try {
  let tabs
  for (let i = 0; i < 60; i++) {
    try { tabs = await (await fetch('http://127.0.0.1:9337/json')).json(); break } catch { await sleep(250) }
  }
  assert.ok(tabs, 'Chrome no pudo iniciarse')
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  let seq = 0
  const pending = new Map()
  const exceptions = []
  socket.addEventListener('close', () => { for (const task of pending.values()) task.reject(new Error('Chrome desconectado')) })
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
    if (message.id) {
      const task = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) task.reject(new Error(message.error.message)); else task.resolve(message.result)
    }
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async expression => {
    const value = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails))
    return value.result.value
  }
  const waitFor = async (expression, timeout = 15000) => {
    const end = Date.now() + timeout
    while (Date.now() < end) { if (await evaluate(expression)) return; await sleep(150) }
    throw new Error('Condición no cumplida: ' + expression)
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' })
  await waitFor("document.querySelectorAll('.product-card').length === 12 && document.querySelector('.radar-control .status')?.textContent === 'Éxito'")
  assert.equal(await evaluate("document.querySelectorAll('.ranking-item').length"), 3)
  await mkdir('docs/evidencias', { recursive: true })
  const shot = await send('Page.captureScreenshot', { captureBeyondViewport: true })
  await writeFile('docs/evidencias/escritorio.png', Buffer.from(shot.data, 'base64'))
  await evaluate("document.querySelector('.radar-actions button').click()")
  await waitFor("document.querySelector('.radar-control .status').textContent === 'Inactivo'")
  const previousTime = await evaluate("document.querySelectorAll('.scan-line strong')[1].textContent")
  await sleep(11000)
  assert.equal(await evaluate("document.querySelectorAll('.scan-line strong')[1].textContent"), previousTime)
  await evaluate("document.querySelector('.radar-actions button').click()")
  await waitFor("document.querySelector('.radar-control .status').textContent === 'Éxito'")
  await evaluate("document.querySelector('.activity').open = true; document.querySelector('.activity button').click()")
  await waitFor("document.querySelector('.radar-control .status').textContent === 'Error'")
  assert.equal(await evaluate("document.querySelectorAll('.product-card').length"), 12)
  const errorShot = await send('Page.captureScreenshot', { captureBeyondViewport: true })
  await writeFile('docs/evidencias/error.png', Buffer.from(errorShot.data, 'base64'))
  await waitFor("document.querySelector('.radar-control .status').textContent === 'Éxito'", 13000)
  await evaluate("document.querySelector('.activity').open = false; [...document.querySelectorAll('.category-filters button')].find(b => b.textContent === 'Procesadores').click()")
  await waitFor("document.querySelectorAll('.product-card').length === 2")
  await evaluate("document.querySelector('.add-button').click(); document.querySelector('.cart-button').click()")
  await waitFor("document.querySelector('dialog').open && document.querySelectorAll('.cart-items li').length === 1")
  await evaluate("document.querySelector('.quantity button:last-child').click()")
  await waitFor("document.querySelector('.quantity span').textContent === '2'")
  await evaluate("document.querySelector('.close-button').click(); document.querySelector('.category-filters button').click()")
  await waitFor("!document.querySelector('dialog').open && document.querySelectorAll('.product-card').length === 12")
  await evaluate("Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(document.querySelector('#search'), 'zzzz'); document.querySelector('#search').dispatchEvent(new Event('input', { bubbles: true }))")
  await waitFor("document.querySelectorAll('.product-card').length === 0")
  await evaluate("document.querySelector('.catalog-section .empty-state button').click()")
  await waitFor("document.querySelectorAll('.product-card').length === 12")
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await sleep(300)
  assert.ok(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), 'Hay desbordamiento móvil')
  const mobileShot = await send('Page.captureScreenshot', { captureBeyondViewport: true })
  await writeFile('docs/evidencias/movil.png', Buffer.from(mobileShot.data, 'base64'))
  assert.deepEqual(exceptions, [])
  console.log('OK: carga, ranking, pausa >10s, reanudación, HTTP 503 y recuperación, filtros, búsqueda, carrito, móvil y ausencia de excepciones.')
  if (process.argv.includes('--report')) {
    await send('Page.navigate', { url: 'file:///' + resolve('docs/informe.html').replaceAll('\\', '/') })
    await sleep(600)
    const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true })
    await writeFile('docs/informe.pdf', Buffer.from(pdf.data, 'base64'))
    console.log('Informe PDF generado.')
  }
} finally {
  socket?.close()
  chrome.kill()
  await sleep(700)
  assert.ok(resolve(profile).startsWith(resolve(tmpdir()) + sep + 'nexus-browser-test-'))
  await rm(profile, { recursive: true, force: true, maxRetries: 3 }).catch(() => {})
}
