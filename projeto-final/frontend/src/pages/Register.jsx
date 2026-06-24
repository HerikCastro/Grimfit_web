import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../components/ToastContext'

function validateEmail(email){
  return /.+@.+\..+/.test(email)
}

export default function Register(){
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()

  async function handleSubmit(e){
    e.preventDefault()
    if (!nome || !email || !senha) return show('Preencha todos os campos', 'error')
    if (!validateEmail(email)) return show('Email inválido', 'error')
    if (senha.length < 6) return show('Senha precisa ter ao menos 6 caracteres', 'error')

    setLoading(true)
    try{
      const res = await register({ nome, email, senha })
      if (res.ok){
        show('Registrado com sucesso. Faça login.', 'success')
        navigate('/login')
      } else {
        show(res.error || 'Erro no registro', 'error')
      }
    }catch(err){
      console.error(err)
      show('Erro ao conectar com servidor', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page" style={{padding:20}}>
      <h1>Registrar</h1>
      <form onSubmit={handleSubmit} style={{display:'grid',gap:8,maxWidth:420}}>
        <input placeholder="Nome completo" value={nome} onChange={e=>setNome(e.target.value)} disabled={loading} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />
        <input placeholder="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} disabled={loading} />
        <button className="btn primary" disabled={loading}>{loading? 'Registrando...':'Registrar'}</button>
      </form>
      <div style={{marginTop:12}}>Já tem conta? <Link to="/login">Entrar</Link></div>
    </div>
  )
}
