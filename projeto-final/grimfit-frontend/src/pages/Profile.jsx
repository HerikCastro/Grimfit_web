import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, getMyOrders, getPreferences, setPreferences as salvarPreferencias, getStyles } from '../api'
import { useToast } from '../components/ToastContext'
import { Link } from 'react-router-dom'

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

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', genero: '' })
  const [senhas, setSenhas] = useState({ senha_atual: '', nova_senha: '' })
  const [pedidos, setPedidos] = useState([])
  const [estilos, setEstilos] = useState([])
  const [preferencias, setPreferencias_] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('dados')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (user) setForm({ nome: user.nome || '', email: user.email || '', telefone: user.telefone || '', genero: user.genero || '' })
    getMyOrders().then(setPedidos).catch(() => {})
    getStyles().then(setEstilos).catch(() => {})
    getPreferences().then(r => setPreferencias_(r.estilos?.map(e => e.id) || [])).catch(() => {})
  }, [user])

  async function handleSalvarDados(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const res = await updateProfile(form)
      if (res.user) updateUser(res.user)
      show('Perfil atualizado', 'success')
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao atualizar', 'error')
    } finally { setSalvando(false) }
  }

  async function handleSenha(e) {
    e.preventDefault()
    try {
      await changePassword(senhas)
      show('Senha alterada', 'success')
      setSenhas({ senha_atual: '', nova_senha: '' })
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
        <div className="profile-avatar">{user?.nome?.[0]?.toUpperCase() || 'U'}</div>
        <div>
          <h1 className="profile-nome">{user?.nome}</h1>
          <span className="profile-email muted">{user?.email}</span>
          {user?.tipo !== 'cliente' && (
            <span className="profile-badge">{user?.tipo}</span>
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
          <strong>{user?.tipo === 'admin' ? 'Admin' : 'Cliente'}</strong>
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
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-campo">
              <label htmlFor="nome">Nome</label>
              <input id="nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="form-campo">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
            </div>
            <div className="form-campo">
              <label>Gênero</label>
              <div className="genero-opcoes">
                {GENEROS.map(g => (
                  <label key={g.value} className={`genero-chip ${form.genero === g.value ? 'selecionado' : ''}`}>
                    <input
                      type="radio"
                      name="genero"
                      value={g.value}
                      checked={form.genero === g.value}
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
              <input id="senha-atual" type="password" value={senhas.senha_atual}
                onChange={e => setSenhas(s => ({ ...s, senha_atual: e.target.value }))} required />
            </div>
            <div className="form-campo">
              <label htmlFor="nova-senha">Nova senha</label>
              <input id="nova-senha" type="password" value={senhas.nova_senha}
                onChange={e => setSenhas(s => ({ ...s, nova_senha: e.target.value }))} required minLength={6} />
            </div>
            <button type="submit" className="btn primary">Trocar senha</button>
          </form>
        )}
      </div>
    </div>
  )
}
