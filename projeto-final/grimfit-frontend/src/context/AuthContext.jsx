import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, setAuthToken, getMe } from '../api'

const AuthContext = createContext()
const STORAGE_KEY = 'grimfit_auth_v1'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  // Recupera sessão salva ao abrir o site. Guardar o token no
  // localStorage aqui é só pra manter o login entre recarregamentos
  // de página — não tem relação com o problema de localStorage em
  // artifacts sandboxed, isso é um app React de verdade.
  useEffect(() => {
    async function restaurarSessao() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const data = JSON.parse(raw)
          if (data.token) {
            setAuthToken(data.token)
            setToken(data.token)
            // Busca o perfil atualizado em vez de confiar cegamente
            // no que ficou salvo (pode ter mudado tipo/nome no banco).
            const perfil = await getMe()
            setUser(perfil)
          }
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setReady(true)
      }
    }
    restaurarSessao()
  }, [])

  async function login(credentials) {
    const res = await loginUser(credentials)
    if (res.ok) {
      setUser(res.user)
      setToken(res.token)
      setAuthToken(res.token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: res.token }))
    }
    return res
  }

  async function register(payload) {
    return await registerUser(payload)
  }

  function logout() {
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
