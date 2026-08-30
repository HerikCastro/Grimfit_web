import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, setAuthToken, getMe } from '../api'

const AuthContext = createContext()
const STORAGE_KEY = 'grimfit_auth_v1'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  // Recupera sessão salva ao abrir o site.
  useEffect(() => {
    async function restaurarSessao() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setReady(true)
        return
      }
      let data
      try {
        data = JSON.parse(raw)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setReady(true)
        return
      }
      if (!data?.token) {
        setReady(true)
        return
      }

      setAuthToken(data.token)
      setToken(data.token)
      try {
        // Busca o perfil atualizado em vez de confiar cegamente no que
        // ficou salvo (pode ter mudado tipo/nome no banco). Nunca deixa
        // a tela de carregamento presa caso a API esteja lenta demais
        // (ex.: back-end gratuito "acordando" depois de ficar inativo).
        const perfil = await Promise.race([
          getMe(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_AUTH')), 8000)
          )
        ])
        setUser(perfil)
      } catch (e) {
        // Só derruba a sessão salva se o servidor realmente disse que o
        // token é inválido/expirado (401). Se foi só timeout, erro de
        // rede ou o servidor lento, mantém o token salvo — o usuário
        // segue navegando como visitante e uma nova tentativa pode
        // funcionar no próximo carregamento, sem forçar login de novo.
        if (e?.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEY)
          setAuthToken(null)
          setToken(null)
        }
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
