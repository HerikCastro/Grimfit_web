import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../components/ToastContext'
import logo from '../assets/grimfit-logo.png'

function validarEmail(email) { return /.+@.+\..+/.test(email) }

export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [erros, setErros] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()

  function atualizar(campo) {
    return e => setForm(f => ({ ...f, [campo]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const novosErros = {}
    if (!form.nome) novosErros.nome = 'Preencha o nome'
    if (!form.email) novosErros.email = 'Preencha o e-mail'
    else if (!validarEmail(form.email)) novosErros.email = 'E-mail inválido'
    if (!form.senha) novosErros.senha = 'Preencha a senha'
    else if (form.senha.length < 6) novosErros.senha = 'Mínimo 6 caracteres'
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    setLoading(true)
    try {
      const res = await register(form)
      if (res.ok) {
        show('Conta criada! Faça login.', 'success')
        navigate('/login')
      } else {
        show(res.message || 'Erro no cadastro', 'error')
      }
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao conectar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-conteudo">
          <img src={logo} alt="" className="auth-logo-big" />
          <p className="auth-slogan">Seu estilo.<br />Sua identidade.</p>
        </div>
      </div>

      <div className="auth-painel">
        <div className="auth-form-wrap">
          <img src={logo} alt="GRIMFIT" className="auth-logo-mobile" />
          <h1 className="auth-titulo">Criar conta</h1>
          <p className="muted auth-subtitulo">É rapidinho</p>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {[
              { id: 'nome', label: 'Nome', type: 'text', campo: 'nome', auto: 'name' },
              { id: 'email', label: 'E-mail', type: 'email', campo: 'email', auto: 'email' },
              { id: 'senha', label: 'Senha', type: 'password', campo: 'senha', auto: 'new-password' }
            ].map(f => (
              <div className="form-campo" key={f.id}>
                <label htmlFor={f.id}>{f.label}</label>
                <input
                  id={f.id}
                  type={f.type}
                  value={form[f.campo]}
                  onChange={atualizar(f.campo)}
                  disabled={loading}
                  className={erros[f.campo] ? 'campo-invalido' : ''}
                  autoComplete={f.auto}
                />
                {erros[f.campo] && (
                  <small className="erro-campo" role="alert" aria-live="polite">{erros[f.campo]}</small>
                )}
              </div>
            ))}
            <button type="submit" className="btn primary full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-links">
            <span className="muted">Já tem conta?</span>
            <Link to="/login">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
