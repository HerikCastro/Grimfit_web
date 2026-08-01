import React from 'react'
import { Link } from 'react-router-dom'
import Img from './Img'

export default function CategorySection({ title = 'Categorias', categories = [] }) {
  if (categories.length === 0) return null
  return (
    <section style={{ margin: '32px 0' }}>
      <h2 className="secao-titulo">{title}</h2>
      <div className="category-grid">
        {categories.map(c => (
          <Link
            key={c.id}
            to={`/catalog?categoria_id=${c.id}`}
            className="category-tile"
          >
            <div className="cat-image">
              <Img src={c.image || c.imagem_url} alt={c.name || c.nome} />
            </div>
            <span>{c.name || c.nome}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
