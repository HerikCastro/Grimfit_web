import React from 'react'
import { Link } from 'react-router-dom'
import Img from './Img'

export default function Hero({ product }){
  const img = product?.image || product?.imagem || '/src/assets/shoe1.svg'
  return (
    <section className="hero">
      <div className="hero-content">
        <div>
          <h1>{product?.title}</h1>
          <p className="muted lead">{product?.subtitle}</p>
          <div className="hero-cta">
            <div className="price">R$ {product?.price}</div>
            <Link className="btn primary" to={`/product/${product?.id}`}>Comprar agora</Link>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="shoe">
          <Img src={img} alt={product?.title} onLoad={e=>{ e.currentTarget.style.opacity='1' }} />
        </div>
      </div>
    </section>
  )
}
