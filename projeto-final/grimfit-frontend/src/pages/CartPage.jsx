import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Img from '../components/Img'

export default function CartPage() {
  const { items, total, loading, refreshCart, updateItem, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) {
    return (
      <div className="cart-page">
        <h1>Seu Carrinho</h1>
        <p>Você precisa <a href="/login">entrar</a> pra ver o carrinho.</p>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1>Seu Carrinho</h1>

      {loading ? (
        <div>Carregando...</div>
      ) : items.length === 0 ? (
        <div>Nenhum item no carrinho ainda.</div>
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
                <div className="cart-item-preco">R$ {item.preco}</div>
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
          <div className="cart-total">Total: R$ {total.toFixed(2).replace('.', ',')}</div>
          <button className="btn primary" onClick={() => navigate('/checkout')}>Finalizar compra</button>
        </div>
      )}
    </div>
  )
}
