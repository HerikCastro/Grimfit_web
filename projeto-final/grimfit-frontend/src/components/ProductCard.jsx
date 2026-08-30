import React from 'react'
import { Link } from 'react-router-dom'
import Img from './Img'

export default function ProductCard({ product }) {
  if (!product) return null
  const img   = product.imagem_url || product.imagem || product.image
  const nome  = product.nome || product.name || 'Produto'
  const preco = product.preco || product.price || '0.00'
  const badge = product.badge || product.tag || null

  return (
    <Link to={`/product/${product.id}`} className="product-card" style={{ display: 'block', textDecoration: 'none' }}>
      {badge && (
        <div className={`product-badge ${badge.toLowerCase()}`} aria-label={badge}>{badge}</div>
      )}
      <div className="product-image">
        <Img src={img} alt={nome} loading="lazy" />
      </div>
      <div className="product-info">
        <div className="product-name">{nome}</div>
        <div className="product-price">R$ {Number(preco).toFixed(2).replace('.', ',')}</div>
      </div>
    </Link>
  )
}
