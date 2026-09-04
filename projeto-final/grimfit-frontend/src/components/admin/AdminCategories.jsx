import React, { useEffect, useState } from 'react'
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api'
import { useToast } from '../ToastContext'
import Img from '../Img'
import ConfirmModal from '../ui/ConfirmModal'

export default function AdminCategories() {
  const { show } = useToast()
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({ nome: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [apagarId, setApagarId] = useState(null)
  const [forcarExclusao, setForcarExclusao] = useState(false)
  const [loadingApagar, setLoadingApagar] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setCategorias(await getCategories()) } catch (e) { console.error(e) }
  }

  function resetForm() { setForm({ nome: '' }); setFile(null); setPreview(null); setEditandoId(null) }

  function handleFile(e) {
    const f = e.target.files[0]
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('nome', form.nome)
      if (file) fd.append('image', file)
      if (editandoId) await adminUpdateCategory(editandoId, fd)
      else await adminCreateCategory(fd)
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
        <div className="form-campo">
          <label>Imagem (opcional)</label>
          <input type="file" accept="image/*" onChange={handleFile} className="input-file" />
          {preview && <Img src={preview} alt="preview" className="admin-preview" />}
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
              <button className="btn" onClick={() => { setEditandoId(c.id); setForm({ nome: c.nome }); setPreview(c.imagem_url) }}>Editar</button>
              <button className="btn danger" onClick={() => setApagarId(c.id)}>Apagar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
