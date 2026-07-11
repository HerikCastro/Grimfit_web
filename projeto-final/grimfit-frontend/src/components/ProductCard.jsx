import React from 'react'
import { Link } from 'react-router-dom'
import Img from './Img'
import { guessFromName } from '../utils/images'

export default function ProductCard({ product }) {
  const raw = product.imagem || product.image || product.picture || guessFromName(product) || '/src/assets/shoe1.svg'
  const name = product.nome || product.name || product.title || 'Produto'
  const price = product.preco || product.price || product.valor || '0.00'
  const badge = product.badge || product.tag || null
  return (
    <div className="product-card">
      {badge && <div className={`product-badge ${badge.toLowerCase()}`}>{badge}</div>}
      <Link to={`/product/${product.id}`}>
        <div className="product-image">
          <Img src={raw} alt={name} loading="lazy" onLoad={e=>{ e.currentTarget.style.opacity='1' }} />
        </div>
      </Link>
      <div className="product-info">
        <div className="product-name">{name}</div>
        <div className="product-price">R$ {price}</div>
      </div>
    </div>
  )
}
