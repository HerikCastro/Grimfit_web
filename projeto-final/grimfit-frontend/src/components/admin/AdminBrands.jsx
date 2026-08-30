import React, { useEffect, useState } from 'react'
import { getBrands, adminCreateBrand, adminUpdateBrand, adminDeleteBrand } from '../../api'
import { useToast } from '../ToastContext'
import Img from '../Img'
import ConfirmModal from '../ui/ConfirmModal'

export default function AdminBrands() {
  const { show } = useToast()
  const [marcas, setMarcas] = useState([])
  const [form, setForm] = useState({ nome: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [modal, setModal] = useState(null)
  const [loadingApagar, setLoadingApagar] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setMarcas(await getBrands()) } catch (e) { console.error(e) }
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
      if (editandoId) await adminUpdateBrand(editandoId, fd)
      else await adminCreateBrand(fd)
      show('Marca salva', 'success')
      resetForm()
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro', 'error')
    } finally { setSalvando(false) }
  }

  async function handleApagar(senha) {
    setLoadingApagar(true)
    try {
      await adminDeleteBrand(modal.id, senha, modal.force || false)
      show('Marca removida', 'success')
      setModal(null)
      await carregar()
    } catch (err) {
      const data = err?.response?.data
      if (err?.response?.status === 409 && data?.pode_forcar) {
        setModal({ id: modal.id, force: true, total: data.total, senhaJa: senha })
        show(`Há ${data.total} produto(s) usando essa marca.`, 'error')
      } else {
        show(data?.message || 'Senha incorreta ou erro', 'error')
      }
    } finally { setLoadingApagar(false) }
  }

  return (
    <div className="admin-secao">
      {modal && !modal.force && (
        <ConfirmModal
          mensagem={`Apagar a marca "${marcas.find(m => m.id === modal.id)?.nome}"?`}
          onConfirm={handleApagar}
          onCancel={() => setModal(null)}
          loading={loadingApagar}
        />
      )}
      {modal && modal.force && (
        <ConfirmModal
          mensagem={`Existem ${modal.total} produto(s) usando essa marca. Eles ficarão sem marca. Confirma?`}
          onConfirm={handleApagar}
          onCancel={() => setModal(null)}
          loading={loadingApagar}
        />
      )}

      <h3>{editandoId ? 'Editar marca' : 'Nova marca'}</h3>
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

      <h3>Marcas</h3>
      <div className="admin-cards-grid small">
        {marcas.map(m => (
          <div key={m.id} className="admin-mini-card">
            <Img src={m.imagem_url} alt={m.nome} className="admin-mini-img" />
            <span>{m.nome}</span>
            <div className="admin-mini-acoes">
              <button className="btn small" onClick={() => {
                setEditandoId(m.id)
                setForm({ nome: m.nome })
                setPreview(m.imagem_url)
                setFile(null)
              }}>Editar</button>
              <button className="btn danger small" onClick={() => setModal({ id: m.id, force: false })}>Apagar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
