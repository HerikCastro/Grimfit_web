import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useToast } from '../components/ToastContext'
import { useCart } from '../context/CartContext'

function validateEmail(email) {
  return /.+@.+\..+/.test(email)
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erros, setErros] = useState({})
  const { login } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { show } = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    const novosErros = {}
    if (!email) novosErros.email = 'Preencha o email'
    else if (!validateEmail(email)) novosErros.email = 'Email inválido'
    if (!senha) novosErros.senha = 'Preencha a senha'
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    setLoading(true)
    try {
      const res = await login({ email, senha })
      if (res.ok) {
        await refreshCart()
        show('Login realizado', 'success')
        navigate(location.state?.from?.pathname || '/')
      } else {
        show(res.message || 'Erro no login', 'error')
      }
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao conectar com servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          className={erros.email ? 'campo-invalido' : ''}
        />
        {erros.email && <small className="erro-campo" role="alert" aria-live="polite">{erros.email}</small>}

        <input
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          disabled={loading}
          className={erros.senha ? 'campo-invalido' : ''}
        />
        {erros.senha && <small className="erro-campo" role="alert" aria-live="polite">{erros.senha}</small>}

        <button className="btn primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <div style={{ marginTop: 12 }}>Ainda não tem conta? <Link to="/register">Registrar</Link></div>
    </div>
  )
}
