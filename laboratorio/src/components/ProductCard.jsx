import { money } from '../lib/catalog'
import ProductArt from './ProductArt'

export default function ProductCard({ product, onAdd }) {
  return <article className="product-card">
    <div className="product-visual"><span className="category-label">{product.category}</span><ProductArt category={product.category} /></div>
    <div className="product-info">
      <div className="product-meta"><span>{product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</span><span className="rating">★ {product.rating.toFixed(1)}</span></div>
      <h3>{product.name}</h3><p>{product.description}</p>
      <div className="product-bottom"><strong>{money(product.price)}</strong><button className="add-button" disabled={!product.stock} onClick={() => onAdd(product)} aria-label={`Agregar ${product.name} al carrito`}>+</button></div>
    </div>
  </article>
}
