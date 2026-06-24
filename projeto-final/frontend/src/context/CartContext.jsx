import React, { createContext, useContext, useEffect, useReducer } from 'react'

const CartStateContext = createContext()
const CartDispatchContext = createContext()

const STORAGE_KEY = 'grimfit_cart_v1'

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return action.payload || []
    case 'add': {
      const item = action.payload
      const exist = state.find(i => i.id === item.id)
      if (exist) {
        return state.map(i => i.id === item.id ? { ...i, qty: i.qty + (item.qty||1) } : i)
      }
      return [...state, { ...item, qty: item.qty || 1 }]
    }
    case 'remove':
      return state.filter(i => i.id !== action.payload)
    case 'updateQty': {
      const { id, qty } = action.payload
      if (qty <= 0) return state.filter(i => i.id !== id)
      return state.map(i => i.id === id ? { ...i, qty } : i)
    }
    case 'clear':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'hydrate', payload: JSON.parse(raw) })
    } catch (e) { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) { /* ignore */ }
  }, [state])

  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  )
}

export function useCart() {
  const state = useContext(CartStateContext)
  if (state === undefined) throw new Error('useCart must be used within CartProvider')
  return state
}

export function useCartActions() {
  const dispatch = useContext(CartDispatchContext)
  if (dispatch === undefined) throw new Error('useCartActions must be used within CartProvider')
  return {
    addToCart: item => dispatch({ type: 'add', payload: item }),
    removeFromCart: id => dispatch({ type: 'remove', payload: id }),
    updateQty: (id, qty) => dispatch({ type: 'updateQty', payload: { id, qty } }),
    clearCart: () => dispatch({ type: 'clear' }),
    hydrateCart: (cart) => dispatch({ type: 'hydrate', payload: cart })
  }
}

export function cartTotal(state) {
  return state.reduce((s, i) => s + (parseFloat(String(i.price).replace(',','.')) || 0) * i.qty, 0)
}
