import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { getVariants } from '../api'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from './ToastContext'
import Img from './Img'

function formatCurrency(value) {
  const number = Number(value || 0)
  return `R$ ${number.toFixed(2).replace('.', ',')}`
}

export default function FavoritesDrawer({ open, onClose }) {
  const { items, loading, removeFavoriteItem } = useFavorites()
  const { addItem } = useCart()
  const { show } = useToast()
  const [addingId, setAddingId] = useState(null)

  async function handleAdd(product) {
    setAddingId(product.id)
    try {
      const variants = await getVariants(product.id)
      const available = (Array.isArray(variants) ? variants : []).find(variant => Number(variant.stock) > 0)
      if (!available) {
        show('Produto sem estoque disponível', 'error')
        return
      }
      await addItem(available.id, 1)
      show('Adicionado ao carrinho', 'success')
    } catch (error) {
      show(error?.response?.data?.message || 'Erro ao adicionar ao carrinho', 'error')
    } finally {
      setAddingId(null)
    }
  }

  async function handleRemove(productId) {
    try {
      await removeFavoriteItem(productId)
      show('Removido dos favoritos', 'success')
    } catch (error) {
      show(error?.response?.data?.message || 'Erro ao remover favorito', 'error')
    }
  }

  return (
    <>
      <button
        type="button"
        className={`favoritos-overlay ${open ? 'visivel' : ''}`}
        aria-label="Fechar favoritos"
        onClick={onClose}
      />
      <aside className={`favoritos-drawer ${open ? 'aberto' : ''}`} aria-hidden={!open} aria-label="Favoritos">
        <div className="favoritos-drawer-header">
          <div>
            <span className="section-kicker">Sua seleção</span>
            <h2>Favoritos</h2>
          </div>
          <button type="button" className="favoritos-fechar" onClick={onClose} aria-label="Fechar favoritos">×</button>
        </div>

        <div className="favoritos-drawer-body">
          {loading ? (
            <p className="muted">Carregando favoritos...</p>
          ) : items.length === 0 ? (
            <div className="favoritos-vazio">
              <span className="favoritos-vazio-icone" aria-hidden="true">♡</span>
              <p>Sua lista de desejos está vazia.</p>
              <Link to="/catalog" className="btn primary" onClick={onClose}>Continuar comprando</Link>
            </div>
          ) : (
            <div className="favoritos-lista">
              {items.map(product => (
                <article key={product.id} className="favorito-item">
                  <Link to={`/product/${product.id}`} onClick={onClose} className="favorito-imagem">
                    <Img src={product.imageUrl} alt={product.name} />
                  </Link>
                  <div className="favorito-info">
                    <Link to={`/product/${product.id}`} onClick={onClose} className="favorito-nome">{product.name}</Link>
                    <span className="favorito-preco">{formatCurrency(product.price)}</span>
                    <div className="favorito-acoes">
                      <button type="button" className="btn primary" onClick={() => handleAdd(product)} disabled={addingId === product.id}>
                        {addingId === product.id ? 'Adicionando...' : 'Adicionar ao carrinho'}
                      </button>
                      <button type="button" className="favorito-remover" onClick={() => handleRemove(product.id)}>Remover</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
