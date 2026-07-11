import React from 'react'
import { Link } from 'react-router-dom'
import Img from './Img'

export default function CategorySection({ title = 'Categorias', categories = [] }){
  return (
    <section className="category-section">
      <h2>{title}</h2>
      <div className="category-grid">
        {categories.map(c => (
          <Link key={c.id} to={`/catalog?q=${encodeURIComponent(c.name)}`} className="category-tile">
            <div className="cat-image">
              <Img src={c.image} alt={c.name} />
            </div>
            <div className="cat-name">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
