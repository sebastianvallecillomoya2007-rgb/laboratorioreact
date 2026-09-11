export const CATEGORIES = ['Tarjetas gráficas', 'Procesadores', 'Memoria RAM', 'Almacenamiento', 'Periféricos', 'Monitores']
export const WINDOW_DAYS = 90

export function validateProducts(data) {
  if (!Array.isArray(data)) throw new Error('El catálogo debe ser una lista de productos.')
  const ids = new Set()
  for (const p of data) {
    if (!p || typeof p.id !== 'string' || !p.id.trim() || ids.has(p.id) ||
      typeof p.name !== 'string' || !p.name.trim() || typeof p.description !== 'string' ||
      !CATEGORIES.includes(p.category) || !Number.isFinite(p.price) || p.price <= 0 ||
      !Number.isInteger(p.stock) || p.stock < 0 || !Number.isFinite(p.rating) || p.rating < 0 || p.rating > 5 ||
      typeof p.releaseDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.releaseDate) ||
      !Number.isFinite(Date.parse(p.releaseDate)) || new Date(p.releaseDate).toISOString().slice(0, 10) !== p.releaseDate) {
      throw new Error('Hay productos inválidos: revisa ID, categoría, precio, stock, valoración y fecha en db.json.')
    }
    ids.add(p.id)
  }
  return data
}

export function rankProducts(products, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return products.filter(p => {
    const age = (today - Date.parse(p.releaseDate)) / 86400000
    return age >= 0 && age <= WINDOW_DAYS && p.stock > 0
  }).sort((a, b) => b.rating - a.rating || b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id)).slice(0, 3)
}

export const money = value => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(value)
export const time = value => new Date(value).toLocaleTimeString('es-CR')
