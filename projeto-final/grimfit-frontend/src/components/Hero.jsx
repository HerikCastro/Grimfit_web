import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Hero({ product }){
  const [imageFailed, setImageFailed] = useState(false)
  const image = product?.imageUrl || product?.image
  const variants = product?.variants || product?.variations || []
  const variantPrices = variants
    .map(variant => Number(variant.price ?? variant.preco))
    .filter(Number.isFinite)
  const productPrice = Number(product?.price ?? product?.preco)
  const price = variantPrices.length > 0 ? Math.min(...variantPrices) : productPrice

  useEffect(() => {
    setImageFailed(false)
  }, [image])

  const priceLabel = Number.isFinite(price) && price >= 0
    ? `R$ ${price.toFixed(2).replace('.', ',')}`
    : null

  return (
    <section className="hero">
      <div className="hero-content">
        <div>
          <h1>{product?.title || product?.name || 'GRIMFIT'}</h1>
          {product?.brand && <p className="hero-brand">{product.brand}</p>}
          {product?.subtitle && <p className="muted lead">{product.subtitle}</p>}
          <div className="hero-cta">
            {priceLabel && <div className="price">{priceLabel}</div>}
            {product?.id && <Link className="btn primary" to={`/product/${product.id}`}>Ver produto <span aria-hidden="true">↗</span></Link>}
          </div>
        </div>
      </div>
      <div className="hero-visual">
        {image && !imageFailed ? (
          <div className="shoe">
            <img src={image} alt={product?.title || product?.name || ''} onError={() => setImageFailed(true)} />
          </div>
        ) : (
          <div className="hero-placeholder">
            <strong>{product?.title || product?.name || 'GRIMFIT'}</strong>
            {product?.brand && <span>{product.brand}</span>}
          </div>
        )}
      </div>
    </section>
  )
}
