import React, { useRef, useState } from 'react'
import ProductCard from './ProductCard'

export default function NovidadesCarousel({ items = [] }) {
  const listRef = useRef(null)
  const [dot, setDot] = useState(0)

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
        <div>
          <button className="nov-arrow" onClick={() => scrollDir(-1)} aria-label="Anterior">‹</button>
          <button className="nov-arrow" onClick={() => scrollDir(1)} aria-label="Próxima">›</button>
        </div>
      </div>
      <div
        className="nov-list"
        ref={listRef}
        onScroll={e => {
          const el = e.currentTarget
          setDot(Math.round(el.scrollLeft / (el.scrollWidth / items.length)))
        }}
      >
        {items.map(p => (
          <div key={p.id} className="nov-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div className="nov-dots" aria-hidden="true">
        {items.map((_, i) => (
          <button key={i} className={`nov-dot ${dot === i ? 'active' : ''}`} onClick={() => {
            if (!listRef.current) return
            const w = listRef.current.scrollWidth / items.length
            listRef.current.scrollTo({ left: w * i, behavior: 'smooth' })
            setDot(i)
          }} />
        ))}
      </div>
    </section>
  )
}
