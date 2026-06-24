import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../api'
import Img from '../components/Img'
import { resolveImage } from '../utils/images'

export default function Admin(){
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nome:'', descricao:'', preco:'0.00', estilo:'', marca_id: '', imagem: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(()=>{ fetchProducts() },[])

  async function fetchProducts(){
    setLoading(true)
    try{
      const res = await adminListProducts()
      if (res.ok) setProducts(res.dados || [])
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  function resetForm(){ setForm({ nome:'', descricao:'', preco:'0.00', estilo:'', marca_id: '' }); setEditingId(null) }

  async function handleSubmit(e){
    e.preventDefault()
    try{
      // if file present, use FormData
      if (file) {
        const fd = new FormData()
        Object.keys(form).forEach(k=> fd.append(k, form[k]))
        fd.append('image', file)
        if (editingId) await adminUpdateProduct(editingId, fd)
        else await adminCreateProduct(fd)
      } else {
        if (editingId) await adminUpdateProduct(editingId, form)
        else await adminCreateProduct(form)
      }
      await fetchProducts()
      resetForm()
    }catch(err){ console.error(err) }
  }

  function startEdit(p){
    setEditingId(p.id)
    setForm({ nome:p.nome||'', descricao:p.descricao||'', preco:String(p.preco||'0.00'), estilo:p.estilo||'', marca_id: p.marca_id || '' })
    // if stored imagem is a filename or relative path, resolve it
    const previewUrl = p.imagem ? resolveImage(p.imagem) : (p.imagem || null)
    setPreview(previewUrl)
    setFile(null)
    setForm(f=>({...f, imagem: p.imagem || ''}))
  }

  async function handleDelete(id){
    if (!confirm('Deletar produto?')) return
    try{ await adminDeleteProduct(id); fetchProducts() }catch(e){ console.error(e) }
  }

  if (!user || user.tipo !== 'admin') return (<div><h2>Acesso negado</h2><p>Você precisa ser administrador para acessar este painel.</p></div>)

  return (
    <div className="admin-page">
      <h1>Painel Admin — Produtos</h1>
      <section className="admin-form">
        <h3>{editingId ? 'Editar produto' : 'Novo produto'}</h3>
        <form onSubmit={handleSubmit}>
          <input value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} placeholder="Nome" required />
          <input value={form.preco} onChange={e=>setForm({...form, preco:e.target.value})} placeholder="Preço" required />
          <input value={form.estilo} onChange={e=>setForm({...form, estilo:e.target.value})} placeholder="Estilo" />
          <input value={form.marca_id} onChange={e=>setForm({...form, marca_id:e.target.value})} placeholder="Marca ID" />
          <textarea value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} placeholder="Descrição" />
          <div>
            <label>Imagem (opcional) — upload ou nome do arquivo em `/img`</label>
            <input type="file" accept="image/*" onChange={e=>{
              const f = e.target.files[0]
              setFile(f)
              if (f) {
                setPreview(URL.createObjectURL(f))
                // clear manual filename when uploading
                setForm(frm=>({...frm, imagem: ''}))
              } else setPreview(null)
            }} />
            <div style={{marginTop:8}}>
              <input placeholder="dcshoes.jpg (opcional)" value={form.imagem} onChange={e=>{ setForm({...form, imagem: e.target.value}); if (e.target.value) setPreview(`/img/${e.target.value}`) }} />
            </div>
            {preview && (<div className="preview"><Img src={preview} alt="preview" style={{maxWidth:180,marginTop:8}}/></div>)}
          </div>
          <div>
            <button type="submit">{editingId ? 'Salvar' : 'Criar'}</button>
            <button type="button" onClick={resetForm}>Cancelar</button>
          </div>
        </form>
      </section>

      <section className="admin-list">
        <h3>Produtos</h3>
        {loading ? <div>Carregando...</div> : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nome</th><th>Preço</th><th>Estilo</th><th>Marca</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p=> (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nome}</td>
                  <td>{p.preco}</td>
                  <td>{p.estilo}</td>
                  <td>{p.marca_id}</td>
                  <td>
                    <button onClick={()=>startEdit(p)}>Editar</button>
                    <button onClick={()=>handleDelete(p.id)}>Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
