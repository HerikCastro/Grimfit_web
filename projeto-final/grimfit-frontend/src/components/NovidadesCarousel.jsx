import React, { useRef } from 'react'
import ProductCard from './ProductCard'

export default function NovidadesCarousel({ items = [] }) {
  const listRef = useRef(null)

  function scrollDir(dir) {
    if (!listRef.current) return
    const w = listRef.current.offsetWidth
    listRef.current.scrollBy({ left: dir * w * 0.8, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <section className="novidades-carousel">
      <div className="nov-header">
        <h2 className="secao-titulo">Novidades</h2>
        <div className="nov-controls">
          <button className="nov-arrow" onClick={() => scrollDir(-1)} aria-label="Anterior">‹</button>
          <button className="nov-arrow" onClick={() => scrollDir(1)} aria-label="Próxima">›</button>
        </div>
      </div>
      <div
        className="nov-list"
        ref={listRef}
      >
        {items.map(p => (
          <div key={p.id} className="nov-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
