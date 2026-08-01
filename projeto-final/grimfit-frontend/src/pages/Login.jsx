import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useToast } from '../components/ToastContext'
import { useCart } from '../context/CartContext'
import logo from '../assets/grimfit-logo.png'

function validarEmail(email) {
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
    if (!email) novosErros.email = 'Preencha o e-mail'
    else if (!validarEmail(email)) novosErros.email = 'E-mail inválido'
    if (!senha) novosErros.senha = 'Preencha a senha'
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    setLoading(true)
    try {
      const res = await login({ email, senha })
      if (res.ok) {
        await refreshCart()
        show('Login realizado', 'success')
        const destino = location.state?.from?.pathname || '/'
        // Se nunca definiu preferências, manda pro onboarding
        if (!res.user?.preferencias_definidas) {
          navigate('/onboarding')
        } else {
          navigate(destino)
        }
      } else {
        show(res.message || 'Erro no login', 'error')
      }
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao conectar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* painel visual esquerdo — some no mobile */}
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-conteudo">
          <img src={logo} alt="" className="auth-logo-big" />
          <p className="auth-slogan">Streetwear de verdade.<br />Sem filtro.</p>
        </div>
      </div>

      {/* formulário direito */}
      <div className="auth-painel">
        <div className="auth-form-wrap">
          <img src={logo} alt="GRIMFIT" className="auth-logo-mobile" />
          <h1 className="auth-titulo">Entrar</h1>
          <p className="muted auth-subtitulo">Bem-vindo de volta</p>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-campo">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className={erros.email ? 'campo-invalido' : ''}
                autoComplete="email"
              />
              {erros.email && <small className="erro-campo" role="alert" aria-live="polite">{erros.email}</small>}
            </div>

            <div className="form-campo">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                disabled={loading}
                className={erros.senha ? 'campo-invalido' : ''}
                autoComplete="current-password"
              />
              {erros.senha && <small className="erro-campo" role="alert" aria-live="polite">{erros.senha}</small>}
            </div>

            <button type="submit" className="btn primary full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-links">
            <span className="muted">Não tem conta?</span>
            <Link to="/register">Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
