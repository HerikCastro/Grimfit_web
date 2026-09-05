import React, { useEffect, useState } from 'react'
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api'
import { useToast } from '../ToastContext'
import ConfirmModal from '../ui/ConfirmModal'

export default function AdminCategories() {
  const { show } = useToast()
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({ nome: '' })
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [apagarId, setApagarId] = useState(null)
  const [forcarExclusao, setForcarExclusao] = useState(false)
  const [loadingApagar, setLoadingApagar] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setCategorias(await getCategories()) } catch (e) { console.error(e) }
  }

  function resetForm() { setForm({ nome: '' }); setEditandoId(null) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      if (editandoId) await adminUpdateCategory(editandoId, form)
      else await adminCreateCategory(form)
      show('Categoria salva', 'success')
      resetForm()
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro', 'error')
    } finally { setSalvando(false) }
  }

  async function handleApagar(senha) {
    setLoadingApagar(true)
    try {
      await adminDeleteCategory(apagarId, senha, forcarExclusao)
      show('Categoria removida', 'success')
      setApagarId(null)
      setForcarExclusao(false)
      await carregar()
    } catch (err) {
      if (err?.response?.status === 409 && !forcarExclusao) {
        setForcarExclusao(true)
      } else {
        show(err?.response?.data?.message || 'Senha incorreta ou há produtos nessa categoria', 'error')
      }
    } finally { setLoadingApagar(false) }
  }

  function cancelarExclusao() {
    setApagarId(null)
    setForcarExclusao(false)
  }

  return (
    <div className="admin-secao">
      {apagarId && (
        <ConfirmModal
          mensagem={forcarExclusao
            ? 'Essa categoria possui produtos vinculados. Apagar mesmo assim?'
            : 'Apagar essa categoria?'}
          onConfirm={handleApagar}
          onCancel={cancelarExclusao}
          loading={loadingApagar}
          confirmLabel={forcarExclusao ? 'Apagar mesmo assim' : 'Confirmar'}
        />
      )}
      <h3>{editandoId ? 'Editar categoria' : 'Nova categoria'}</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-campo">
          <label>Nome</label>
          <input value={form.nome} onChange={e => setForm({ nome: e.target.value })} required />
        </div>
        <div className="admin-form-acoes">
          <button type="submit" className="btn primary" disabled={salvando}>{editandoId ? 'Salvar' : 'Criar'}</button>
          {editandoId && <button type="button" className="btn" onClick={resetForm}>Cancelar</button>}
        </div>
      </form>
      <h3>Categorias</h3>
      <div className="admin-cards-grid small">
        {categorias.map(c => (
          <div key={c.id} className="admin-mini-card">
            <span>{c.nome}</span>
            <div className="admin-mini-acoes">
              <button className="btn" onClick={() => { setEditandoId(c.id); setForm({ nome: c.nome }) }}>Editar</button>
              <button className="btn danger" onClick={() => setApagarId(c.id)}>Apagar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
