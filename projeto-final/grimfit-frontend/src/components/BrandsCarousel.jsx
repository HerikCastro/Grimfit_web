import React, { useRef } from 'react'
import Img from './Img'

export default function BrandsCarousel({ brands = [] }) {
  const ref = useRef(null)
  if (brands.length === 0) return null

  return (
    <section style={{ margin: '32px 0' }}>
      <div className="nov-header">
        <h2 className="secao-titulo">Marcas</h2>
        <div className="nov-controls">
          <button className="nov-arrow" onClick={() => ref.current?.scrollBy({ left: -200, behavior: 'smooth' })} aria-label="Anterior">‹</button>
          <button className="nov-arrow" onClick={() => ref.current?.scrollBy({ left: 200, behavior: 'smooth' })} aria-label="Próxima">›</button>
        </div>
      </div>
      <div className="nov-list" ref={ref}>
        {brands.map(b => (
          <div key={b.id} className="bubble">
            <Img src={b.logo || b.imagem_url} alt={b.name || b.nome} />
            <span className="brand-name">{b.name || b.nome}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
