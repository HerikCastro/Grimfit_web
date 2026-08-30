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
  // modal pode ser null | { id, force: false } | { id, force: true, total, senhaJa }
  const [modal, setModal] = useState(null)
  const [loadingApagar, setLoadingApagar] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setCategorias(await getCategories()) } catch (e) { console.error(e) }
  }

  function resetForm() {
    setForm({ nome: '' }); setFile(null); setPreview(null); setEditandoId(null)
  }

  function handleFile(e) {
    const f = e.target.files[0]
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!editandoId && !file) { show('Imagem é obrigatória', 'error'); return }
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('nome', form.nome)
      if (file) fd.append('imagem', file)
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
      await adminDeleteCategory(modal.id, senha, modal.force || false)
      show('Categoria removida', 'success')
      setModal(null)
      await carregar()
    } catch (err) {
      const data = err?.response?.data
      // Backend retornou 409 com pode_forcar=true: há produtos vinculados
      if (err?.response?.status === 409 && data?.pode_forcar) {
        // Guarda a senha já digitada e abre o modal de força
        setModal({ id: modal.id, force: true, total: data.total, senhaJa: senha })
        show(`Há ${data.total} produto(s) nessa categoria. Confirme abaixo pra apagar mesmo assim.`, 'error')
      } else {
        show(data?.message || 'Senha incorreta ou erro', 'error')
      }
    } finally { setLoadingApagar(false) }
  }

  return (
    <div className="admin-secao">
      {modal && !modal.force && (
        <ConfirmModal
          mensagem={`Apagar a categoria "${categorias.find(c => c.id === modal.id)?.nome}"? Produtos vinculados podem ficar sem categoria.`}
          onConfirm={handleApagar}
          onCancel={() => setModal(null)}
          loading={loadingApagar}
        />
      )}
      {modal && modal.force && (
        <ConfirmModal
          mensagem={`Existem ${modal.total} produto(s) nessa categoria. Eles ficarão sem categoria. Tem certeza que quer apagar mesmo assim?`}
          onConfirm={(senha) => handleApagar(senha)}
          onCancel={() => setModal(null)}
          loading={loadingApagar}
        />
      )}

      <h3>{editandoId ? 'Editar categoria' : 'Nova categoria'}</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-campo">
          <label>Nome</label>
          <input value={form.nome} onChange={e => setForm({ nome: e.target.value })} required />
        </div>
        <div className="form-campo">
          <label>Imagem {!editandoId && <span className="campo-obrigatorio">*</span>}</label>
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
            <Img src={c.imagem_url} alt={c.nome} className="admin-mini-img" />
            <span>{c.nome}</span>
            <div className="admin-mini-acoes">
              <button className="btn small" onClick={() => {
                setEditandoId(c.id)
                setForm({ nome: c.nome })
                setPreview(c.imagem_url)
                setFile(null)
              }}>Editar</button>
              <button className="btn danger small" onClick={() => setModal({ id: c.id, force: false })}>Apagar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
