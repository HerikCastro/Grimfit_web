import React, { useEffect, useState } from 'react'
import { getProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getCategories, getBrands, getStyles, getVariants } from '../../api'
import { useToast } from '../ToastContext'
import Img from '../Img'
import AdminVariants from './AdminVariants'
import ConfirmModal from '../ui/ConfirmModal'
import Textarea from '../ui/Textarea'

const VAZIO = { name: '', description: '', price: '', categoryId: '', brandId: '', styleIds: [], variants: [] }

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
      setProdutos(res.products || [])
    } catch (e) { console.error(e) }
  }

  function resetForm() {
    setForm(VAZIO); setFile(null); setPreview(null); setEditandoId(null)
  }

  function adicionarVariante() {
    setForm(f => ({ ...f, variants: [...f.variants, { size: '', color: '', stock: 0 }] }))
  }

  function atualizarVariante(index, campo, valor) {
    setForm(f => ({
      ...f,
      variants: f.variants.map((variant, i) => i === index ? { ...variant, [campo]: valor } : variant)
    }))
  }

  function removerVariante(index) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }))
  }

  function handleFile(e) {
    const f = e.target.files[0]
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function toggleEstilo(id) {
    setForm(f => ({
      ...f,
      styleIds: f.styleIds.includes(id)
        ? f.styleIds.filter(i => i !== id)
        : [...f.styleIds, id]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!editandoId && !file) { show('Imagem é obrigatória', 'error'); return }
    if (!form.styleIds.length) { show('Selecione ao menos um estilo', 'error'); return }
    setSalvando(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      if (form.categoryId) fd.append('categoryId', form.categoryId)
      if (form.brandId) fd.append('brandId', form.brandId)
      form.styleIds.forEach(id => fd.append('styleIds[]', id))
      fd.append('variants', JSON.stringify(form.variants.map(v => ({
        ...(v.id ? { id: v.id } : {}),
        size: v.size,
        color: v.color,
        stock: Number(v.stock)
      }))))
      if (file) fd.append('image', file)
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

  async function editar(p) {
    setEditandoId(p.id)
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: String(p.price || ''),
      categoryId: p.categoryId || '',
      brandId: p.brandId || '',
      styleIds: p.styles?.map(e => e.id) || [],
      variants: []
    })
    setPreview(p.imageUrl)
    setFile(null)
    try {
      const variantes = await getVariants(p.id)
      setForm(f => ({ ...f, variants: Array.isArray(variantes) ? variantes : [] }))
    } catch (e) { console.error(e) }
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
          <input id="p-nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="form-campo">
          <label htmlFor="p-desc">Descrição</label>
          <Textarea
            id="p-desc"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descreva o produto..."
          />
        </div>
        <div className="admin-form-row">
          <div className="form-campo">
            <label htmlFor="p-preco">Preço (R$)</label>
            <input id="p-preco" type="number" step="0.01" min="0" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
          <div className="form-campo">
            <label>Categoria</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Sem categoria</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="form-campo">
            <label>Marca</label>
            <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}>
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
                className={`estilo-chip ${form.styleIds.includes(e.id) ? 'selecionado' : ''}`}
                onClick={() => toggleEstilo(e.id)}
                aria-pressed={form.styleIds.includes(e.id)}
              >
                {e.name || e.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="form-campo">
          <label>Imagem {editandoId ? '(opcional — só se quiser trocar)' : <span className="campo-obrigatorio">*</span>}</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="input-file" />
          {preview && <Img src={preview} alt="preview" className="admin-preview" />}
        </div>

        <div className="form-campo">
          <label>Variantes (Cor, Tamanho e Estoque)</label>
          <div className="admin-form-variantes">
            {form.variants.map((variant, index) => (
              <div className="admin-form-variante" key={variant.id || index}>
                <input
                  placeholder="Tamanho"
                  value={variant.size || ''}
                  onChange={e => atualizarVariante(index, 'size', e.target.value)}
                />
                <input
                  placeholder="Cor"
                  value={variant.color || ''}
                  onChange={e => atualizarVariante(index, 'color', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Estoque"
                  value={variant.stock ?? 0}
                  onChange={e => atualizarVariante(index, 'stock', e.target.value)}
                />
                <button type="button" className="btn danger small" onClick={() => removerVariante(index)}>Remover</button>
              </div>
            ))}
            <button type="button" className="btn" onClick={adicionarVariante}>+ Adicionar variante</button>
          </div>
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
                <Img src={p.imageUrl} alt={p.name} />
              </div>
              <div className="admin-produto-info">
                <span className="admin-produto-nome">{p.name}</span>
                <span className="admin-produto-preco">R$ {Number(p.price).toFixed(2).replace('.', ',')}</span>
                {p.styles?.length > 0 && (
                  <div className="admin-produto-estilos">
                    {p.styles.map(e => <span key={e.id} className="estilo-tag">{e.name}</span>)}
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
