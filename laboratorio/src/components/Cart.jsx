import { useEffect, useRef } from 'react'
import { money } from '../lib/catalog'

export default function Cart({ open, onClose, items, onQuantity, onClear }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (open) dialog.showModal()
    else dialog.close()
  }, [open])
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  return <dialog ref={dialogRef} onCancel={onClose} onClose={onClose} className="cart-dialog" aria-labelledby="cart-title">
    <div className="section-heading"><h2 id="cart-title">Tu selección</h2><button className="close-button" onClick={onClose} aria-label="Cerrar carrito">×</button></div>
    <p className="subtle">Carrito de demostración · precios en colones.</p>
    {!items.length ? <p className="empty-state">Tu próximo setup empieza con un componente. Agrega productos desde el catálogo.</p> : <>
      <ul className="cart-items">{items.map(({ product, quantity }) => <li key={product.id}><div><strong>{product.name}</strong><p>{money(product.price)} por unidad · stock: {product.stock}</p></div><div className="quantity"><button onClick={() => onQuantity(product.id, quantity - 1)} aria-label={`Quitar una unidad de ${product.name}`}>−</button><span>{quantity}</span><button disabled={quantity >= product.stock} onClick={() => onQuantity(product.id, quantity + 1)} aria-label={`Añadir una unidad de ${product.name}`}>+</button></div></li>)}</ul>
      <div className="cart-total"><span>Total estimado</span><strong>{money(total)}</strong></div><button className="button button-dark" onClick={onClear}>Vaciar carrito</button>
    </>}
    <p className="cart-disclaimer">Proyecto académico: no se procesan pagos ni pedidos reales. La selección se ajusta al stock después de cada sincronización y se conserva durante esta sesión.</p>
  </dialog>
}
