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

  const addItem = useCallback(async (variantId, quantity = 1) => {
    await addCartItem(variantId, quantity)
    await refreshCart()
  }, [refreshCart])

  const updateItem = useCallback(async (itemId, quantity) => {
    await updateCartItem(itemId, quantity)
    await refreshCart()
  }, [refreshCart])

  const removeItem = useCallback(async (itemId) => {
    await removeCartItem(itemId)
    await refreshCart()
  }, [refreshCart])

  const clearLocal = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    return sum + price * item.quantity
  }, 0)

  const count = items.reduce((sum, item) => sum + item.quantity, 0)

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
