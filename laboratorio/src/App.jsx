import { useState } from 'react'
import { useRadar } from './hooks/useRadar'
import { CATEGORIES } from './lib/catalog'
import ProductArt from './components/ProductArt'
import ProductCard from './components/ProductCard'
import RadarPanel from './components/RadarPanel'
import Cart from './components/Cart'
import './App.css'

export default function App() {
  const radar = useRadar()
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const items = radar.products.filter(p => cart[p.id] && p.stock > 0).map(product => ({ product, quantity: Math.min(cart[product.id], product.stock) }))
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const products = radar.products.filter(p => (category === 'Todos' || p.category === category) && normalize(`${p.name} ${p.category} ${p.description}`).includes(normalize(search)))
    .sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : sort === 'newest' ? b.releaseDate.localeCompare(a.releaseDate) : b.rating - a.rating)

  function add(product) {
    const quantity = Math.min(cart[product.id] || 0, product.stock)
    if (quantity >= product.stock) { setNotice(`Ya agregaste todo el stock disponible de ${product.name}.`); return }
    setCart(previous => ({ ...previous, [product.id]: quantity + 1 }))
    setNotice(`${product.name} agregado a tu selección.`)
  }

  return <>
    <a className="skip-link" href="#catalogo">Saltar al catálogo</a>
    <div className="announcement"><span>HARDWARE PARA TU SIGUIENTE NIVEL</span><span>Proyecto académico · Catálogo de demostración</span></div>
    <header className="site-header"><a className="brand" href="#inicio" aria-label="Nexus Gaming, inicio"><span className="brand-mark">N</span><span>NEXUS<small>GAMING</small></span></a><nav aria-label="Navegación principal"><a href="#catalogo">Catálogo</a><a href="#radar">Radar de novedades <span className="nav-dot" /></a><a href="#acerca">El proyecto</a></nav><button className="cart-button" onClick={() => setCartOpen(true)}>Mi carrito <span>{count}</span></button></header>
    <main id="inicio">
      <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> TU SETUP. TUS REGLAS.</p><h1 id="hero-title">El siguiente nivel<br />empieza <em>aquí.</em></h1><p className="hero-description">Potencia para cada partida. Componentes y periféricos para construir el setup que tienes en mente.</p><div className="hero-actions"><a className="button button-lime" href="#catalogo">Explorar componentes ↗</a><a className="hero-link" href="#radar">Descubrir novedades ↓</a></div><div className="hero-footnote"><span>COMPONENTES</span><i /> <span>PERIFÉRICOS</span><i /><span>TODO TU SETUP</span></div></div><div className="hero-art"><div className="orbital orbital-one" /><div className="orbital orbital-two" /><span className="art-caption">ENGINEERED TO PLAY.</span><ProductArt category="Tarjetas gráficas" large /><div className="hero-art-bottom"><span>RENDIMIENTO<br /><strong>SIN LÍMITES.</strong></span><span className="hardware-tag">GPU / NEXUS SERIES<br />ILUSTRACIÓN CONCEPTUAL</span></div></div></section>
      <div className="benefits"><p><span>↻</span><strong>Novedades en automático</strong><small>Un nuevo escaneo cada 10 segundos</small></p><p><span>◎</span><strong>Elige con criterio</strong><small>Ranking por valoración y fecha</small></p><p><span>▦</span><strong>Arma tu próximo setup</strong><small>Seis categorías para explorar</small></p></div>
      <RadarPanel radar={radar} onAdd={add} />
      <section id="catalogo" className="catalog-section" aria-labelledby="catalog-title"><div className="section-heading"><div><p className="eyebrow">ELIGE TU PRÓXIMA MEJORA</p><h2 id="catalog-title">Todo para tu setup<span className="heading-dot">.</span></h2></div><span className="subtle">{radar.products.length} productos en el catálogo</span></div>
        <div className="catalog-toolbar"><div className="search-field"><label htmlFor="search">Buscar en el catálogo</label><input id="search" type="search" placeholder="Busca tu próximo componente…" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="sort-field"><label htmlFor="sort">Ordenar por</label><select id="sort" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Mejor valoración</option><option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select></div></div>
        <div className="category-filters" role="group" aria-label="Filtrar por categoría">{['Todos', ...CATEGORIES].map(name => <button key={name} className={category === name ? 'selected' : ''} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div>
        <p className="results-count" role="status">{products.length} resultados{search && ` para “${search}”`}</p>
        <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} onAdd={add} />)}</div>
        {!products.length && <div className="empty-state"><h3>{radar.updatedAt ? 'No encontramos productos' : 'Esperando el catálogo'}</h3><p>{radar.updatedAt ? 'Prueba otra búsqueda o categoría.' : 'Comprueba el estado del radar y que la API esté en ejecución.'}</p>{radar.updatedAt && <button className="button button-dark" onClick={() => { setSearch(''); setCategory('Todos') }}>Limpiar filtros</button>}</div>}
      </section>
      <section id="acerca" className="about"><div><p className="eyebrow">MENOS BÚSQUEDA. MÁS JUEGO.</p><h2>Una tienda que se mantiene al día.</h2></div><p>El radar revisa nuestro catálogo local y vuelve a calcular las novedades sin que tengas que recargar la página. Los nombres, precios, valoraciones y fechas son ficticios para demostrar la automatización; no representan lanzamientos reales del mercado.</p></section>
    </main>
    <footer><a className="footer-brand" href="#inicio">NEXUS<span> / GAMING</span></a><p>Laboratorio de React · Automatización de catálogo</p><a href="#radar">Volver al radar ↑</a></footer>
    <div className="toast" role="status">{notice && <><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></>}</div>
    <Cart open={cartOpen} onClose={() => setCartOpen(false)} items={items} onQuantity={(id, quantity) => setCart(previous => ({ ...previous, [id]: quantity }))} onClear={() => setCart({})} />
  </>
}
