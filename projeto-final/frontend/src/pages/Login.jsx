import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../components/ToastContext'
import { getUserCart, saveUserCart } from '../api'
import { useCart, useCartActions } from '../context/CartContext'

function validateEmail(email){
  return /.+@.+\..+/.test(email)
}

export default function Login(){
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()
  const localCart = useCart()
  const { hydrateCart } = useCartActions()

  async function handleSubmit(e){
    e.preventDefault()
    if (!email || !senha) return show('Preencha email e senha', 'error')
    if (!validateEmail(email)) return show('Email inválido', 'error')

    setLoading(true)
    try{
      const res = await login({ email, senha })
      if (res.ok){
        // após login, sincroniza carrinho local com o servidor (merge)
        try{
          const srv = await getUserCart()
          const serverCart = Array.isArray(srv.cart) ? srv.cart : []

          // merge localCart + serverCart by key: id|size|color
          const map = new Map()
          function key(i){ return `${i.id}::${i.size||''}::${i.color||''}` }
          ;[...serverCart, ...localCart].forEach(it => {
            const k = key(it)
            const existing = map.get(k)
            if (existing) existing.qty = (existing.qty||0) + (it.qty||1)
            else map.set(k, { ...it, qty: it.qty || 1 })
          })
          const merged = Array.from(map.values())

          // atualiza local e servidor
          hydrateCart(merged)
          await saveUserCart(merged)
        }catch(err){
          console.error('Erro sincronizando carrinho:', err)
        }

        show('Login realizado', 'success')
        navigate('/')
      } else {
        show(res.error || 'Erro no login', 'error')
      }
    }catch(err){
      console.error(err)
      show('Erro ao conectar com servidor', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page" style={{padding:20}}>
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit} style={{display:'grid',gap:8,maxWidth:420}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />
        <input placeholder="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} disabled={loading} />
        <button className="btn primary" disabled={loading}>{loading? 'Entrando...':'Entrar'}</button>
      </form>
      <div style={{marginTop:12}}>Ainda não tem conta? <Link to="/register">Registrar</Link></div>
    </div>
  )
}
