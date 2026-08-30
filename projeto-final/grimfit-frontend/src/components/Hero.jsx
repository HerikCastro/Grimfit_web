import React from 'react'
import { Link } from 'react-router-dom'
import Img from './Img'

export default function Hero({ product }){
  const img = product?.image || product?.imagem || '/src/assets/shoe1.svg'
  const price = Number(product?.price)
  const priceLabel = Number.isFinite(price)
    ? `R$ ${price.toFixed(2).replace('.', ',')}`
    : `R$ ${product?.price ?? '0,00'}`
  return (
    <section className="hero">
      <div className="hero-content">
        <div>
          <h1>{product?.title}</h1>
          <p className="muted lead">{product?.subtitle}</p>
          <div className="hero-cta">
            <div className="price">{priceLabel}</div>
            <Link className="btn primary" to={`/product/${product?.id}`}>Ver produto <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="shoe">
          <Img src={img} alt={product?.title} />
        </div>
      </div>
    </section>
  )
}
