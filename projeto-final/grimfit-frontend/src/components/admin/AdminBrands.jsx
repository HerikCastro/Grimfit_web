import React, { useEffect, useState } from 'react'
import { getBrands, adminCreateBrand, adminUpdateBrand, adminDeleteBrand } from '../../api'
import { useToast } from '../ToastContext'
import Img from '../Img'

const VAZIO = { nome: '' }

export default function AdminBrands() {
  const { show } = useToast()
  const [marcas, setMarcas] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setMarcas(await getBrands()) } catch (e) { console.error(e) }
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
      show('Imagem é obrigatória pra criar marca', 'error')
      return
    }
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
      show(err?.response?.data?.message || 'Erro ao salvar marca', 'error')
    } finally {
      setSalvando(false)
    }
  }

  function editar(m) {
    setEditandoId(m.id)
    setForm({ nome: m.nome })
    setPreview(m.imagem_url)
    setFile(null)
  }

  async function apagar(id) {
    if (!window.confirm('Apagar essa marca?')) return
    try {
      await adminDeleteBrand(id)
      show('Marca removida', 'success')
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao remover', 'error')
    }
  }

  return (
    <div className="admin-secao">
      <h3>{editandoId ? 'Editar marca' : 'Nova marca'}</h3>
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

      <h3>Marcas cadastradas</h3>
      {marcas.length === 0 ? <p className="muted">Nenhuma marca ainda.</p> : (
        <table className="admin-table">
          <thead><tr><th>Imagem</th><th>Nome</th><th>Ações</th></tr></thead>
          <tbody>
            {marcas.map(m => (
              <tr key={m.id}>
                <td><Img src={m.imagem_url} alt={m.nome} className="admin-thumb" /></td>
                <td>{m.nome}</td>
                <td>
                  <button onClick={() => editar(m)}>Editar</button>
                  <button onClick={() => apagar(m.id)}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
