import React, { useEffect, useState } from 'react'
import { getEstilos, adminCreateEstilo, adminUpdateEstilo, adminDeleteEstilo } from '../../api'
import { useToast } from '../ToastContext'
import ConfirmModal from '../ui/ConfirmModal'

export default function AdminEstilos() {
  const { show } = useToast()
  const [estilos, setEstilos] = useState([])
  const [nome, setNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [apagarId, setApagarId] = useState(null)
  const [loadingApagar, setLoadingApagar] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setEstilos(await getEstilos()) } catch (e) { console.error(e) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true)
    try {
      if (editandoId) {
        await adminUpdateEstilo(editandoId, { nome })
      } else {
        await adminCreateEstilo({ nome })
      }
      show(editandoId ? 'Estilo atualizado' : 'Estilo criado', 'success')
      setNome('')
      setEditandoId(null)
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao salvar', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function handleApagar(senha) {
    setLoadingApagar(true)
    try {
      await adminDeleteEstilo(apagarId, senha)
      show('Estilo removido', 'success')
      setApagarId(null)
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Senha incorreta ou erro', 'error')
    } finally {
      setLoadingApagar(false)
    }
  }

  return (
    <div className="admin-secao">
      {apagarId && (
        <ConfirmModal
          mensagem="Tem certeza que quer apagar esse estilo? Produtos vinculados perdem essa tag."
          onConfirm={handleApagar}
          onCancel={() => setApagarId(null)}
          loading={loadingApagar}
        />
      )}

      <h3>{editandoId ? 'Editar estilo' : 'Novo estilo'}</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          placeholder="Nome do estilo (ex: Streetwear, Gótico, Sportlife)"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <div className="admin-form-acoes">
          <button type="submit" disabled={salvando}>{editandoId ? 'Salvar' : 'Criar'}</button>
          {editandoId && (
            <button type="button" onClick={() => { setEditandoId(null); setNome('') }}>Cancelar</button>
          )}
        </div>
      </form>

      <h3>Estilos cadastrados</h3>
      {estilos.length === 0 ? (
        <p className="muted">Nenhum estilo ainda. Crie os estilos antes de cadastrar produtos.</p>
      ) : (
        <div className="estilos-lista-admin">
          {estilos.map(e => (
            <div key={e.id} className="estilo-item-admin">
              <span>{e.nome}</span>
              <div className="estilo-acoes">
                <button onClick={() => { setEditandoId(e.id); setNome(e.nome) }}>Editar</button>
                <button className="danger" onClick={() => setApagarId(e.id)}>Apagar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
