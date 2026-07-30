import React, { useEffect, useState } from 'react'
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api'
import { useToast } from '../ToastContext'
import Img from '../Img'

const VAZIO = { nome: '' }

export default function AdminCategories() {
  const { show } = useToast()
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setCategorias(await getCategories()) } catch (e) { console.error(e) }
  }

  function resetForm() {
    setForm(VAZIO); setFile(null); setPreview(null); setEditandoId(null)
  }

  function handleFile(e) {
    const f = e.target.files[0]
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!editandoId && !file) {
      show('Imagem é obrigatória pra criar categoria', 'error')
      return
    }
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
      show(err?.response?.data?.message || 'Erro ao salvar categoria', 'error')
    } finally {
      setSalvando(false)
    }
  }

  function editar(c) {
    setEditandoId(c.id)
    setForm({ nome: c.nome })
    setPreview(c.imagem_url)
    setFile(null)
  }

  async function apagar(id) {
    if (!window.confirm('Apagar essa categoria?')) return
    try {
      await adminDeleteCategory(id)
      show('Categoria removida', 'success')
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao remover', 'error')
    }
  }

  return (
    <div className="admin-secao">
      <h3>{editandoId ? 'Editar categoria' : 'Nova categoria'}</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({ nome: e.target.value })} required />
        <label>Imagem {editandoId ? '(opcional, só se quiser trocar)' : '(obrigatória)'}</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {preview && <Img src={preview} alt="preview" className="admin-preview" />}
        <div className="admin-form-acoes">
          <button type="submit" disabled={salvando}>{editandoId ? 'Salvar' : 'Criar'}</button>
          {editandoId && <button type="button" onClick={resetForm}>Cancelar</button>}
        </div>
      </form>

      <h3>Categorias cadastradas</h3>
      {categorias.length === 0 ? <p className="muted">Nenhuma categoria ainda.</p> : (
        <table className="admin-table">
          <thead><tr><th>Imagem</th><th>Nome</th><th>Ações</th></tr></thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id}>
                <td><Img src={c.imagem_url} alt={c.nome} className="admin-thumb" /></td>
                <td>{c.nome}</td>
                <td>
                  <button onClick={() => editar(c)}>Editar</button>
                  <button onClick={() => apagar(c.id)}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
