import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, setAuthToken, getMe } from '../api'

const AuthContext = createContext()
const STORAGE_KEY = 'grimfit_auth_v1'

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw){
        const data = JSON.parse(raw)
        setUser(data.user)
        setToken(data.token)
        setAuthToken(data.token)
      }
    }catch(e){/*ignore*/}
  },[])

  // If token exists but user is null, try to fetch /me
  useEffect(()=>{
    async function fetchMe(){
      if (token && !user){
        try{
          const res = await getMe()
          if (res.ok) setUser(res.user)
        }catch(e){
          console.error('Could not fetch /me', e.message)
        }
      }
    }
    fetchMe()
  },[token, user])

  useEffect(()=>{
    if (token) setAuthToken(token)
    else setAuthToken(null)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
  },[user, token])

  async function login(credentials){
    const res = await loginUser(credentials)
    if (res.ok){
      setUser(res.user)
      setToken(res.token)
    }
    return res
  }

  async function register(payload){
    const res = await registerUser(payload)
    return res
  }

  function logout(){
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
