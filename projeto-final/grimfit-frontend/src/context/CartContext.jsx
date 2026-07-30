import React, { createContext, useContext, useState, useCallback } from 'react'
import { getCart, addCartItem, updateCartItem, removeCartItem } from '../api'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Busca o carrinho de verdade no backend. Só funciona com o
  // usuário logado (a rota /api/cart exige token) — por isso só
  // deve ser chamado depois do login confirmar.
  const refreshCart = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCart()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      // Sem login ainda, ou erro de rede — carrinho fica vazio,
      // não quebra a tela.
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = useCallback(async (variacaoId, quantidade = 1) => {
    await addCartItem(variacaoId, quantidade)
    await refreshCart()
  }, [refreshCart])

  const updateItem = useCallback(async (itemId, quantidade) => {
    await updateCartItem(itemId, quantidade)
    await refreshCart()
  }, [refreshCart])

  const removeItem = useCallback(async (itemId) => {
    await removeCartItem(itemId)
    await refreshCart()
  }, [refreshCart])

  const clearLocal = useCallback(() => setItems([]), [])

  const total = items.reduce((soma, item) => {
    const preco = parseFloat(item.preco) || 0
    return soma + preco * item.quantidade
  }, 0)

  const count = items.reduce((soma, item) => soma + item.quantidade, 0)

  return (
    <CartContext.Provider value={{
      items,
      loading,
      total,
      count,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clearLocal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
