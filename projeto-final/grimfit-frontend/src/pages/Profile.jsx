import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, getMyOrders, getPreferences, setPreferences as salvarPreferencias, getStyles } from '../api'
import { useToast } from '../components/ToastContext'
import { Link } from 'react-router-dom'
import Img from '../components/Img'

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'prefiro_nao_informar', label: 'Prefiro não informar' },
  { value: 'outro', label: 'Outro' }
]

const STATUS_LABEL = {
  pendente: 'Pendente', pago: 'Pago', separacao: 'Em separação',
  enviado: 'Enviado', saiu_entrega: 'Saiu p/ entrega',
  entregue: 'Entregue', cancelado: 'Cancelado'
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { show } = useToast()

  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [pedidos, setPedidos] = useState([])
  const [estilos, setEstilos] = useState([])
  const [preferencias, setPreferencias_] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('dados')
  const [salvando, setSalvando] = useState(false)
  const [foto, setFoto] = useState(null)
  const [previewFoto, setPreviewFoto] = useState(null)

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', gender: user.gender || '' })
    getMyOrders().then(setPedidos).catch(() => {})
    getStyles().then(setEstilos).catch(() => {})
    getPreferences().then(r => setPreferencias_(r.styles?.map(e => e.id) || [])).catch(() => {})
  }, [user])

  async function handleSalvarDados(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const dados = new FormData()
      dados.append('name', form.name)
      dados.append('email', form.email)
      dados.append('phone', form.phone)
      dados.append('gender', form.gender)
      if (foto) dados.append('image', foto)

      const res = await updateProfile(dados)
      if (res.user) updateUser(res.user)
      setFoto(null)
      setPreviewFoto(null)
      show('Perfil atualizado', 'success')
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao atualizar', 'error')
    } finally { setSalvando(false) }
  }

  function handleFoto(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setFoto(arquivo)
    setPreviewFoto(URL.createObjectURL(arquivo))
  }

  async function handleSenha(e) {
    e.preventDefault()
    try {
      await changePassword(passwords)
      show('Senha alterada', 'success')
      setPasswords({ currentPassword: '', newPassword: '' })
    } catch (err) { show(err?.response?.data?.message || 'Erro', 'error') }
  }

  async function handlePreferencias() {
    try {
      await salvarPreferencias(preferencias)
      show('Preferências salvas', 'success')
    } catch { show('Erro ao salvar', 'error') }
  }

  function togglePreferencia(id) {
    setPreferencias_(ant => ant.includes(id) ? ant.filter(i => i !== id) : [...ant, id])
  }

  const ABAS = [
    { chave: 'dados', rotulo: 'Dados pessoais' },
    { chave: 'pedidos', rotulo: 'Pedidos' },
    { chave: 'preferencias', rotulo: 'Preferências' },
    { chave: 'seguranca', rotulo: 'Segurança' }
  ]

  return (
    <div className="profile-page">
      <div className="profile-topo">
        <div className="profile-avatar">
          {previewFoto || user?.imageUrl ? (
            <Img src={previewFoto || user.imageUrl} alt="Foto de perfil" />
          ) : (
            user?.name?.[0]?.toUpperCase() || 'U'
          )}
        </div>
        <div>
          <h1 className="profile-nome">{user?.name}</h1>
          <span className="profile-email muted">{user?.email}</span>
          {user?.role !== 'cliente' && (
            <span className="profile-badge">{user?.role}</span>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span>Pedidos</span>
          <strong>{pedidos.length}</strong>
        </div>
        <div className="profile-stat">
          <span>Preferências</span>
          <strong>{preferencias.length}</strong>
        </div>
        <div className="profile-stat">
          <span>Plano</span>
          <strong>{user?.role === 'admin' ? 'Admin' : 'Cliente'}</strong>
        </div>
      </div>

      <div className="profile-abas" role="tablist">
        {ABAS.map(a => (
          <button
            key={a.chave}
            role="tab"
            aria-selected={abaAtiva === a.chave}
            className={`profile-aba ${abaAtiva === a.chave ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva(a.chave)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="profile-conteudo">

        {abaAtiva === 'dados' && (
          <form onSubmit={handleSalvarDados} className="profile-form">
            <div className="form-campo">
              <label htmlFor="foto-perfil">Foto de perfil</label>
              <input
                id="foto-perfil"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFoto}
                className="input-file"
              />
              {previewFoto && <Img src={previewFoto} alt="Preview da foto de perfil" className="profile-foto-preview" />}
            </div>
            <div className="form-campo">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-campo">
              <label htmlFor="nome">Nome</label>
              <input id="nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-campo">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-campo">
              <label>Gênero</label>
              <div className="genero-opcoes">
                {GENEROS.map(g => (
                  <label key={g.value} className={`genero-chip ${form.gender === g.value ? 'selecionado' : ''}`}>
                    <input
                      type="radio"
                      name="genero"
                      value={g.value}
                      checked={form.gender === g.value}
                      onChange={() => setForm(f => ({ ...f, genero: g.value }))}
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn primary" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        )}

        {abaAtiva === 'pedidos' && (
          <div className="pedidos-lista">
            {pedidos.length === 0 ? (
              <div className="estado-vazio">
                <p>Nenhum pedido ainda.</p>
                <Link to="/catalog" className="btn primary">Explorar loja</Link>
              </div>
            ) : pedidos.map(p => (
              <Link key={p.id} to={`/order/${p.id}`} className="pedido-card">
                <div className="pedido-card-esquerda">
                  <span className="pedido-num">Pedido #{p.id}</span>
                  <span className="muted">{new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="pedido-card-direita">
                  <span className={`pedido-status status-${p.status}`}>{STATUS_LABEL[p.status] || p.status}</span>
                  <span className="pedido-valor">R$ {Number(p.valor_total).toFixed(2).replace('.', ',')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {abaAtiva === 'preferencias' && (
          <div className="preferencias-secao">
            <p className="muted">Seus estilos favoritos — usamos isso pra mostrar produtos que combinam com você.</p>
            <div className="estilos-grid">
              {estilos.map(e => (
                <button
                  key={e.id}
                  type="button"
                  className={`estilo-chip ${preferencias.includes(e.id) ? 'selecionado' : ''}`}
                  onClick={() => togglePreferencia(e.id)}
                  aria-pressed={preferencias.includes(e.id)}
                >
                  {e.nome}
                </button>
              ))}
            </div>
            <button className="btn primary" onClick={handlePreferencias} style={{ marginTop: 16 }}>
              Salvar preferências
            </button>
          </div>
        )}

        {abaAtiva === 'seguranca' && (
          <form onSubmit={handleSenha} className="profile-form">
            <div className="form-campo">
              <label htmlFor="senha-atual">Senha atual</label>
              <input id="senha-atual" type="password" value={passwords.currentPassword}
                onChange={e => setPasswords(s => ({ ...s, currentPassword: e.target.value }))} required />
            </div>
            <div className="form-campo">
              <label htmlFor="nova-senha">Nova senha</label>
              <input id="nova-senha" type="password" value={passwords.newPassword}
                onChange={e => setPasswords(s => ({ ...s, newPassword: e.target.value }))} required minLength={6} />
            </div>
            <button type="submit" className="btn primary">Trocar senha</button>
          </form>
        )}
      </div>
    </div>
  )
}
