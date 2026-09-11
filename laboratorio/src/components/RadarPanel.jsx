import { useEffect, useState } from 'react'
import { money, time } from '../lib/catalog'

const labels = { inactivo: 'Inactivo', ejecutando: 'En ejecución', exito: 'Éxito', error: 'Error' }

export default function RadarPanel({ radar, onAdd }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const remaining = radar.nextAt ? Math.min(radar.intervalMs / 1000, Math.max(0, Math.ceil((radar.nextAt - now) / 1000))) : null
  return <section id="radar" className="radar-section" aria-labelledby="radar-title">
    <div className="section-heading"><div><p className="eyebrow">UNA VENTAJA EN TIEMPO REAL</p><h2 id="radar-title">Radar de novedades<span className="live-dot" /></h2></div><span className="subtle">Tu próxima mejora, en automático.</span></div>
    <div className="radar-layout">
      <div className="radar-control">
        <div className="radar-control-top"><span className="mono">NEXUS / AUTO SCAN</span><span className={`status ${radar.status}`} role="status">{labels[radar.status]}</span></div>
        <h3>Lo nuevo. Lo mejor.<br />Sin buscar de más.</h3><p>Seleccionamos los 3 lanzamientos con stock mejor valorados de los últimos 90 días de nuestro catálogo.</p>
        <div className="scan-line"><span>Sincronización</span><strong>{!radar.active ? 'Pausada' : radar.status === 'ejecutando' ? 'Consultando…' : `Cada ${radar.intervalMs / 1000} segundos`}</strong></div>
        <div className="scan-line"><span>Última actualización</span><strong>{radar.updatedAt ? time(radar.updatedAt) : 'Pendiente'}</strong></div>
        <div className="radar-actions"><button className="button button-lime" onClick={radar.toggle}>{radar.active ? 'Ⅱ Pausar radar' : '▷ Reanudar radar'}</button><button className="button button-dark" disabled={radar.status === 'ejecutando'} onClick={() => radar.refresh()}>↻ Actualizar</button></div>
        <p className="next-scan">{!radar.active ? 'Reanuda para consultar las novedades.' : radar.status === 'ejecutando' ? 'Validando catálogo y calculando ranking…' : `Próximo ciclo en ${remaining ?? 10} s`}</p>
        {radar.error && <p className="error-message" role="alert">{radar.error} {radar.updatedAt && 'Se muestran los últimos datos válidos.'}</p>}
      </div>
      <div className="ranking-list" aria-label="Top 3 automático">
        {radar.ranking.length ? radar.ranking.map((product, index) => <article className="ranking-item" key={product.id}>
          <span className="rank-number">0{index + 1}</span><div className="rank-detail"><span className="category-label">{product.category}</span><h3>{product.name}</h3><p>★ {product.rating.toFixed(1)} <span>· Lanzamiento {product.releaseDate}</span></p></div><div className="rank-buy"><strong>{money(product.price)}</strong><button onClick={() => onAdd(product)} aria-label={`Agregar ${product.name} desde el radar`}>Agregar ↗</button></div>
        </article>) : <div className="empty-state"><span className="empty-icon">◎</span><h3>{radar.status === 'ejecutando' ? 'Explorando el catálogo…' : 'Sin novedades para mostrar'}</h3><p>{radar.updatedAt ? 'No hay lanzamientos con stock dentro de los últimos 90 días.' : 'El radar mostrará aquí su selección al completar una consulta.'}</p></div>}
        <p className="ranking-note">01 — Valoración · 02 — Fecha más reciente · 03 — ID para desempatar</p>
      </div>
    </div>
    <details className="activity"><summary>Actividad de la automatización <span>{radar.history.length} eventos</span></summary><div className="activity-content"><p>Prueba el camino de error: simula una respuesta HTTP 503 y observa la recuperación en el siguiente ciclo.</p><button className="button button-dark" disabled={radar.status === 'ejecutando'} onClick={() => radar.refresh(true)}>Simular fallo de una consulta</button><ol>{radar.history.map(event => <li key={event.id}><time>{time(event.at)}</time><span className={`status ${event.status}`}>{labels[event.status]}</span><span>{event.message}</span></li>)}</ol>{!radar.history.length && <p>Todavía no se han registrado consultas.</p>}</div></details>
  </section>
}
