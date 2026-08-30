import React, { useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Img from '../components/Img'

export default function CartPage() {
  const { items, total, loading, refreshCart, updateItem, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const formatCurrency = (value) => {
    const number = Number(value ?? 0)
    if (!Number.isFinite(number)) return 'R$ 0,00'
    return `R$ ${number.toFixed(2).replace('.', ',')}`
  }

  useEffect(() => {
    if (user) refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) {
    return (
      <div className="cart-page">
        <h1>Seu Carrinho</h1>
        <p>Você precisa <Link to="/login" state={{ from: location }}>entrar</Link> pra ver o carrinho.</p>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <h1>Seu Carrinho</h1>
        <span className="cart-count">{items.length} item{items.length === 1 ? '' : 's'}</span>
      </div>

      {loading ? (
        <div className="cart-carregando">
          <div className="skeleton-card" aria-hidden="true">
            <div className="skeleton-image" />
            <div className="skeleton-line" />
          </div>
          <div className="skeleton-card" aria-hidden="true">
            <div className="skeleton-image" />
            <div className="skeleton-line" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="estado-vazio">
          <p>Seu carrinho está vazio.</p>
          <Link to="/catalog" className="btn primary">Ver produtos</Link>
        </div>
      ) : (
        <div className="cart-list">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-imagem">
                <Img src={item.imagem_url} alt={item.nome} />
              </div>
              <div className="cart-item-info">
                <div className="cart-item-nome">{item.nome}</div>
                <div className="muted">Tamanho: {item.tamanho || '-'} • Cor: {item.cor || '-'}</div>
                <div className="cart-item-preco">{formatCurrency(item.preco)}</div>
              </div>
              <div className="cart-item-acoes">
                <div className="quantidade-controle">
                  <button onClick={() => updateItem(item.id, item.quantidade - 1)} disabled={item.quantidade <= 1}>-</button>
                  <span>{item.quantidade}</span>
                  <button onClick={() => updateItem(item.id, item.quantidade + 1)}>+</button>
                </div>
                <button className="remover" onClick={() => removeItem(item.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="cart-summary">
          <div className="summary-line"><span>Subtotal</span><strong>{formatCurrency(total)}</strong></div>
          <div className="summary-line"><span>Frete</span><strong>Grátis</strong></div>
          <div className="cart-total">Total: {formatCurrency(total)}</div>
          <button className="btn primary" onClick={() => navigate('/checkout')}>Finalizar compra</button>
        </div>
      )}
    </div>
  )
}
