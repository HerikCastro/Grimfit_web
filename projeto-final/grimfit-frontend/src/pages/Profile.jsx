import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, getMyOrders } from '../api'
import { useToast } from '../components/ToastContext'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user, logout } = useAuth()
  const { show } = useToast()

  const [form, setForm] = useState({ nome: '', telefone: '' })
  const [senhas, setSenhas] = useState({ senha_atual: '', nova_senha: '' })
  const [pedidos, setPedidos] = useState([])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (user) setForm({ nome: user.nome || '', telefone: user.telefone || '' })
    getMyOrders().then(setPedidos).catch(() => setPedidos([]))
  }, [user])

  async function handleSalvarPerfil(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await updateProfile(form)
      show('Perfil atualizado', 'success')
    } catch (err) {
      show('Erro ao atualizar perfil', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function handleTrocarSenha(e) {
    e.preventDefault()
    try {
      await changePassword(senhas)
      show('Senha alterada', 'success')
      setSenhas({ senha_atual: '', nova_senha: '' })
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao trocar senha', 'error')
    }
  }

  if (!user) return <div>Carregando perfil...</div>

  return (
    <div className="profile-page">
      <h1>Meu Perfil</h1>

      <section className="profile-secao">
        <h3>Dados pessoais</h3>
        <form onSubmit={handleSalvarPerfil} className="form-perfil">
          <label>Email (não editável)</label>
          <input value={user.email} disabled />

          <label>Nome</label>
          <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />

          <label>Telefone</label>
          <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />

          <button type="submit" className="btn primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </section>

      <section className="profile-secao">
        <h3>Trocar senha</h3>
        <form onSubmit={handleTrocarSenha} className="form-perfil">
          <label>Senha atual</label>
          <input type="password" value={senhas.senha_atual} onChange={e => setSenhas({ ...senhas, senha_atual: e.target.value })} required />

          <label>Nova senha</label>
          <input type="password" value={senhas.nova_senha} onChange={e => setSenhas({ ...senhas, nova_senha: e.target.value })} required minLength={6} />

          <button type="submit" className="btn">Trocar senha</button>
        </form>
      </section>

      <section className="profile-secao">
        <h3>Meus pedidos</h3>
        {pedidos.length === 0 ? (
          <p className="muted">Nenhum pedido ainda.</p>
        ) : (
          <ul className="lista-pedidos">
            {pedidos.map(p => (
              <li key={p.id}>
                <Link to={`/order/${p.id}`}>Pedido #{p.id}</Link> — {p.status} — R$ {p.valor_total}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button className="btn" onClick={logout}>Sair da conta</button>
    </div>
  )
}
