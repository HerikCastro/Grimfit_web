import React from 'react'
import ProductCard from './ProductCard'

export default function FeaturedSection({ title, products }){
  return (
    <section className="featured-section">
      <h2>{title}</h2>
      <div className="grid small">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
