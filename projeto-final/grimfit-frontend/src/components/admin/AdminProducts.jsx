import React, { useEffect, useState } from 'react'
import { getProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getCategories, getBrands, getStyles } from '../../api'
import { useToast } from '../ToastContext'
import Img from '../Img'
import AdminVariants from './AdminVariants'
import ConfirmModal from '../ui/ConfirmModal'
import Textarea from '../ui/Textarea'

const VAZIO = { nome: '', descricao: '', preco: '', categoria_id: '', marca_id: '', estilo_ids: [] }

export default function AdminProducts() {
  const { show } = useToast()
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [estilos, setEstilos] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [expandidoId, setExpandidoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [apagarId, setApagarId] = useState(null)
  const [loadingApagar, setLoadingApagar] = useState(false)

  useEffect(() => {
    carregar()
    getCategories().then(setCategorias).catch(() => {})
    getBrands().then(setMarcas).catch(() => {})
    getStyles().then(setEstilos).catch(() => {})
  }, [])

  async function carregar() {
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

  function toggleEstilo(id) {
    setForm(f => ({
      ...f,
      estilo_ids: f.estilo_ids.includes(id)
        ? f.estilo_ids.filter(i => i !== id)
        : [...f.estilo_ids, id]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!editandoId && !file) { show('Imagem é obrigatória', 'error'); return }
    if (!form.estilo_ids.length) { show('Selecione ao menos um estilo', 'error'); return }
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('nome', form.nome)
      fd.append('descricao', form.descricao)
      fd.append('preco', form.preco)
      if (form.categoria_id) fd.append('categoria_id', form.categoria_id)
      if (form.marca_id) fd.append('marca_id', form.marca_id)
      form.estilo_ids.forEach(id => fd.append('estilo_ids[]', id))
      if (file) fd.append('imagem', file)
      if (editandoId) await adminUpdateProduct(editandoId, fd)
      else await adminCreateProduct(fd)
      show('Produto salvo', 'success')
      resetForm()
      await carregar()
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
      marca_id: p.marca_id || '',
      estilo_ids: p.estilos?.map(e => e.id) || []
    })
    setPreview(p.imagem_url)
    setFile(null)
  }

  async function handleApagar(senha) {
    setLoadingApagar(true)
    try {
      await adminDeleteProduct(apagarId, senha)
      show('Produto removido', 'success')
      setApagarId(null)
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Senha incorreta ou produto tem pedidos vinculados', 'error')
    } finally {
      setLoadingApagar(false)
    }
  }

  return (
    <div className="admin-secao">
      {apagarId && (
        <ConfirmModal
          mensagem="Apagar esse produto? Essa ação não pode ser desfeita."
          onConfirm={handleApagar}
          onCancel={() => setApagarId(null)}
          loading={loadingApagar}
        />
      )}

      <h3>{editandoId ? 'Editar produto' : 'Novo produto'}</h3>

      {estilos.length === 0 && (
        <div className="admin-aviso">
          ⚠️ Crie os <strong>estilos</strong> antes de cadastrar produtos — são obrigatórios.
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-campo">
          <label htmlFor="p-nome">Nome</label>
          <input id="p-nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
        </div>
        <div className="form-campo">
          <label htmlFor="p-desc">Descrição</label>
          <Textarea
            id="p-desc"
            value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            placeholder="Descreva o produto..."
          />
        </div>
        <div className="admin-form-row">
          <div className="form-campo">
            <label htmlFor="p-preco">Preço (R$)</label>
            <input id="p-preco" type="number" step="0.01" min="0" value={form.preco}
              onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} required />
          </div>
          <div className="form-campo">
            <label>Categoria</label>
            <select value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}>
              <option value="">Sem categoria</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="form-campo">
            <label>Marca</label>
            <select value={form.marca_id} onChange={e => setForm(f => ({ ...f, marca_id: e.target.value }))}>
              <option value="">Sem marca</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="form-campo">
          <label>Estilos <span className="campo-obrigatorio">*</span></label>
          <div className="estilos-grid compact">
            {estilos.map(e => (
              <button
                key={e.id}
                type="button"
                className={`estilo-chip ${form.estilo_ids.includes(e.id) ? 'selecionado' : ''}`}
                onClick={() => toggleEstilo(e.id)}
                aria-pressed={form.estilo_ids.includes(e.id)}
              >
                {e.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="form-campo">
          <label>Imagem {editandoId ? '(opcional — só se quiser trocar)' : <span className="campo-obrigatorio">*</span>}</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="input-file" />
          {preview && <Img src={preview} alt="preview" className="admin-preview" />}
        </div>

        <div className="admin-form-acoes">
          <button type="submit" className="btn primary" disabled={salvando}>
            {salvando ? 'Salvando...' : editandoId ? 'Salvar' : 'Criar produto'}
          </button>
          {editandoId && <button type="button" className="btn" onClick={resetForm}>Cancelar</button>}
        </div>
      </form>

      <h3>Produtos cadastrados</h3>
      {produtos.length === 0 ? (
        <p className="muted">Nenhum produto ainda.</p>
      ) : (
        <div className="admin-cards-grid">
          {produtos.map(p => (
            <div key={p.id} className="admin-produto-card">
              <div className="admin-produto-img">
                <Img src={p.imagem_url} alt={p.nome} />
              </div>
              <div className="admin-produto-info">
                <span className="admin-produto-nome">{p.nome}</span>
                <span className="admin-produto-preco">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</span>
                {p.estilos?.length > 0 && (
                  <div className="admin-produto-estilos">
                    {p.estilos.map(e => <span key={e.id} className="estilo-tag">{e.nome}</span>)}
                  </div>
                )}
              </div>
              <div className="admin-produto-acoes">
                <button className="btn" onClick={() => editar(p)}>Editar</button>
                <button className="btn danger" onClick={() => setApagarId(p.id)}>Apagar</button>
                <button className="btn" onClick={() => setExpandidoId(expandidoId === p.id ? null : p.id)}>
                  {expandidoId === p.id ? 'Fechar' : 'Variações'}
                </button>
              </div>
              {expandidoId === p.id && (
                <div className="admin-produto-variantes">
                  <AdminVariants produtoId={p.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
