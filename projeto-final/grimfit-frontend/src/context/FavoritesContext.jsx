import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { addFavorite, getFavorites, removeFavorite } from '../api'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext()
const CACHE_KEY = 'grimfit_favorites_cache_v1'

function normalizeProduct(product) {
  return {
    ...product,
    id: Number(product.id),
    name: product.name || product.nome || 'Produto',
    price: product.price ?? product.preco ?? 0,
    imageUrl: product.imageUrl || product.imagem_url || product.image
  }
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
    return Array.isArray(cached) ? cached.map(normalizeProduct) : []
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return []
  }
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(() => readCache())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items))
  }, [items])

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const favorites = await getFavorites()
      setItems(Array.isArray(favorites) ? favorites.map(normalizeProduct) : [])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshFavorites().catch(() => {})
  }, [refreshFavorites])

  const isFavorite = useCallback((productId) => (
    items.some(item => Number(item.id) === Number(productId))
  ), [items])

  const toggleFavorite = useCallback(async (product) => {
    if (!user) return { requiresLogin: true }

    const normalized = normalizeProduct(product)
    const alreadyFavorite = isFavorite(normalized.id)
    const previous = items
    setItems(current => alreadyFavorite
      ? current.filter(item => Number(item.id) !== normalized.id)
      : [normalized, ...current]
    )

    try {
      if (alreadyFavorite) await removeFavorite(normalized.id)
      else await addFavorite(normalized.id)
      return { favorited: !alreadyFavorite }
    } catch (error) {
      setItems(previous)
      throw error
    }
  }, [isFavorite, items, user])

  const removeFavoriteItem = useCallback(async (productId) => {
    if (!user) return
    const previous = items
    setItems(current => current.filter(item => Number(item.id) !== Number(productId)))
    try {
      await removeFavorite(productId)
    } catch (error) {
      setItems(previous)
      throw error
    }
  }, [items, user])

  return (
    <FavoritesContext.Provider value={{
      items,
      count: items.length,
      loading,
      isFavorite,
      refreshFavorites,
      toggleFavorite,
      removeFavoriteItem
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites deve ser usado dentro de FavoritesProvider')
  return context
}
