import { useEffect, useRef, useState } from 'react'
import { rankProducts, validateProducts } from '../lib/catalog'

export function useRadar(intervalMs = 10000) {
  const [active, setActive] = useState(true)
  const [revision, setRevision] = useState(0)
  const [snapshot, setSnapshot] = useState({ status: 'inactivo', products: [], ranking: [], error: '', updatedAt: null, nextAt: null, history: [] })
  const failNext = useRef(false)

  useEffect(() => {
    if (!active) return
    let disposed = false
    let busy = false
    let controller
    let timeoutId

    async function synchronize() {
      if (busy || disposed) return
      busy = true
      const startedAt = Date.now()
      controller = new AbortController()
      let timedOut = false
      setSnapshot(previous => ({ ...previous, status: 'ejecutando', error: '', nextAt: null }))
      timeoutId = setTimeout(() => { timedOut = true; controller.abort() }, 6000)
      const simulate = failNext.current
      failNext.current = false
      try {
        const response = await fetch(simulate ? '/api/demo-error' : '/api/products', { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${simulate ? 'fallo de demostración; el próximo ciclo reintentará automáticamente.' : 'no se pudo consultar el catálogo.'}`)
        const products = validateProducts(await response.json())
        const now = new Date()
        const ranking = rankProducts(products, now)
        if (!disposed) setSnapshot(previous => ({
          ...previous, status: 'exito', products, ranking, error: '', updatedAt: now.toISOString(), nextAt: startedAt + intervalMs,
          history: [{ id: crypto.randomUUID(), status: 'exito', at: now.toISOString(), message: `${products.length} productos consultados · ${ranking.length} novedades seleccionadas` }, ...previous.history].slice(0, 8),
        }))
      } catch (error) {
        if (!disposed) setSnapshot(previous => ({
          ...previous, status: 'error', error: timedOut ? 'Tiempo de espera agotado (6 s). Se reintentará automáticamente.' : error.message,
          nextAt: startedAt + intervalMs,
          history: [{ id: crypto.randomUUID(), status: 'error', at: new Date().toISOString(), message: timedOut ? 'Petición cancelada por tiempo de espera.' : error.message }, ...previous.history].slice(0, 8),
        }))
      } finally {
        clearTimeout(timeoutId)
        busy = false
      }
    }

    // Se programa después del montaje para que StrictMode pueda limpiar el primer efecto.
    const firstTick = setTimeout(synchronize, 0)
    const interval = setInterval(synchronize, intervalMs)
    return () => {
      disposed = true
      clearTimeout(firstTick)
      clearTimeout(timeoutId)
      clearInterval(interval)
      controller?.abort()
    }
  }, [active, revision, intervalMs])

  function toggle() {
    if (active) setSnapshot(previous => ({ ...previous, status: 'inactivo', nextAt: null }))
    setActive(previous => !previous)
  }

  function refresh(simulate = false) {
    failNext.current = simulate
    setActive(true)
    setRevision(previous => previous + 1)
  }

  return { ...snapshot, active, toggle, refresh, intervalMs }
}
