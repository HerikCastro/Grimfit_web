import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from './ToastContext'
import Img from './Img'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { show } = useToast()
  if (!product) return null
  const img   = product.imageUrl || product.image
  const nome  = product.name || 'Produto'
  const preco = product.price || '0.00'
  const badge = product.badge || product.tag || null
  const favoritado = isFavorite(product.id)

  async function handleFavorite(event) {
    event.preventDefault()
    event.stopPropagation()
    if (!user) {
      show('Faça login pra favoritar', 'error')
      navigate('/login')
      return
    }
    try {
      await toggleFavorite(product)
    } catch (error) {
      show(error?.response?.data?.message || 'Erro ao atualizar favorito', 'error')
    }
  }

  return (
    <Link to={`/product/${product.id}`} className="product-card" style={{ display: 'block', textDecoration: 'none' }}>
      {badge && (
        <div className={`product-badge ${badge.toLowerCase()}`} aria-label={badge}>{badge}</div>
      )}
      <button
        type="button"
        className={`product-favorite ${favoritado ? 'ativo' : ''}`}
        onClick={handleFavorite}
        aria-label={favoritado ? `Remover ${nome} dos favoritos` : `Adicionar ${nome} aos favoritos`}
        aria-pressed={favoritado}
      >
        <span aria-hidden="true">{favoritado ? '♥' : '♡'}</span>
      </button>
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
