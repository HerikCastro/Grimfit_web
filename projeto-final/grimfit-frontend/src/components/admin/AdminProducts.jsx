import React, { useEffect, useState } from 'react'
import { getProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getCategories, getBrands } from '../../api'
import { useToast } from '../ToastContext'
import Img from '../Img'
import AdminVariants from './AdminVariants'

const VAZIO = { nome: '', descricao: '', preco: '', categoria_id: '', marca_id: '' }

export default function AdminProducts() {
  const { show } = useToast()
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [expandidoId, setExpandidoId] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarProdutos()
    getCategories().then(setCategorias).catch(() => setCategorias([]))
    getBrands().then(setMarcas).catch(() => setMarcas([]))
  }, [])

  async function carregarProdutos() {
    try {
      const res = await getProducts({ limit: 100 })
      setProdutos(res.produtos || [])
    } catch (e) { console.error(e) }
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
      show('Imagem é obrigatória pra criar produto', 'error')
      return
    }
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('nome', form.nome)
      fd.append('descricao', form.descricao)
      fd.append('preco', form.preco)
      if (form.categoria_id) fd.append('categoria_id', form.categoria_id)
      if (form.marca_id) fd.append('marca_id', form.marca_id)
      if (file) fd.append('imagem', file)

      if (editandoId) await adminUpdateProduct(editandoId, fd)
      else await adminCreateProduct(fd)

      show('Produto salvo', 'success')
      resetForm()
      await carregarProdutos()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao salvar produto', 'error')
    } finally {
      setSalvando(false)
    }
  }

  function editar(p) {
    setEditandoId(p.id)
    setForm({
      nome: p.nome || '',
      descricao: p.descricao || '',
      preco: String(p.preco || ''),
      categoria_id: p.categoria_id || '',
      marca_id: p.marca_id || ''
    })
    setPreview(p.imagem_url)
    setFile(null)
  }

  async function apagar(id) {
    if (!window.confirm('Apagar esse produto? Isso também remove as variações dele.')) return
    try {
      await adminDeleteProduct(id)
      show('Produto removido', 'success')
      await carregarProdutos()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao remover — provavelmente tem pedido vinculado', 'error')
    }
  }

  return (
    <div className="admin-secao">
      <h3>{editandoId ? 'Editar produto' : 'Novo produto'}</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
        <textarea placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
        <input placeholder="Preço" type="number" step="0.01" min="0" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} required />

        <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
          <option value="">Sem categoria</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>

        <select value={form.marca_id} onChange={e => setForm({ ...form, marca_id: e.target.value })}>
          <option value="">Sem marca</option>
          {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>

        <label>Imagem {editandoId ? '(opcional, só se quiser trocar)' : '(obrigatória)'}</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {preview && <Img src={preview} alt="preview" className="admin-preview" />}

        <div className="admin-form-acoes">
          <button type="submit" disabled={salvando}>{editandoId ? 'Salvar' : 'Criar'}</button>
          {editandoId && <button type="button" onClick={resetForm}>Cancelar</button>}
        </div>
      </form>

      <h3>Produtos cadastrados</h3>
      {produtos.length === 0 ? <p className="muted">Nenhum produto ainda.</p> : (
        <table className="admin-table">
          <thead><tr><th>Imagem</th><th>Nome</th><th>Preço</th><th>Categoria</th><th>Marca</th><th>Ações</th></tr></thead>
          <tbody>
            {produtos.map(p => (
              <React.Fragment key={p.id}>
                <tr>
                  <td><Img src={p.imagem_url} alt={p.nome} className="admin-thumb" /></td>
                  <td>{p.nome}</td>
                  <td>R$ {p.preco}</td>
                  <td>{p.categoria_nome || '-'}</td>
                  <td>{p.marca_nome || '-'}</td>
                  <td>
                    <button onClick={() => editar(p)}>Editar</button>
                    <button onClick={() => apagar(p.id)}>Apagar</button>
                    <button onClick={() => setExpandidoId(expandidoId === p.id ? null : p.id)}>
                      {expandidoId === p.id ? 'Fechar variações' : 'Variações'}
                    </button>
                  </td>
                </tr>
                {expandidoId === p.id && (
                  <tr>
                    <td colSpan={6}>
                      <AdminVariants produtoId={p.id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
