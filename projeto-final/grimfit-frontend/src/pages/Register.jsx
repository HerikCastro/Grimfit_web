import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../components/ToastContext'

function validateEmail(email) {
  return /.+@.+\..+/.test(email)
}

export default function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erros, setErros] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    const novosErros = {}
    if (!nome) novosErros.nome = 'Preencha o nome'
    if (!email) novosErros.email = 'Preencha o email'
    else if (!validateEmail(email)) novosErros.email = 'Email inválido'
    if (!senha) novosErros.senha = 'Preencha a senha'
    else if (senha.length < 6) novosErros.senha = 'Senha precisa ter ao menos 6 caracteres'
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    setLoading(true)
    try {
      const res = await register({ nome, email, senha })
      if (res.ok) {
        show('Registrado com sucesso. Faça login.', 'success')
        navigate('/login')
      } else {
        show(res.message || 'Erro no registro', 'error')
      }
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao conectar com servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <h1>Registrar</h1>
      <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input
          placeholder="Nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
          disabled={loading}
          className={erros.nome ? 'campo-invalido' : ''}
        />
        {erros.nome && <small className="erro-campo" role="alert" aria-live="polite">{erros.nome}</small>}

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

        <button className="btn primary" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
      </form>
      <div style={{ marginTop: 12 }}>Já tem conta? <Link to="/login">Entrar</Link></div>
    </div>
  )
}
