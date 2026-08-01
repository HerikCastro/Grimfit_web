import React from 'react'
import ProductCard from './ProductCard'

export default function FeaturedSection({ title = 'Mais vendidos', products = [] }) {
  if (products.length === 0) return null
  return (
    <section style={{ margin: '32px 0' }}>
      <h2 className="secao-titulo">{title}</h2>
      <div className="grid">
        {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
