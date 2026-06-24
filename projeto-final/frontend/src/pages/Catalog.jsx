import React, { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import { getProducts } from '../api'

export default function Catalog(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [pagination, setPagination] = useState({ page:1, total:0 })

  const sampleProducts = [
    { id: 101, nome: 'Jaqueta Tech', preco: '299,90', imagem: 'corteiz.jpg', descricao: 'Jaqueta leve, forro térmico.' },
    { id: 102, nome: 'Camiseta Oversize', preco: '89,90', imagem: 'gotico.png', descricao: 'Camiseta cotton oversized.' },
    { id: 103, nome: 'Tênis Runner', preco: '349,90', imagem: 'dcshoes.jpg', descricao: 'Runner confortável para dia a dia.' },
    { id: 104, nome: 'Calça Cargo', preco: '199,90', imagem: 'sportlife.png', descricao: 'Calça utilitária com bolsos.' }
  ]

  useEffect(()=>{
    // show sample products immediately for visual testing, then try to fetch real ones
    setProducts(sampleProducts)
    fetchProducts()
  },[])

  async function fetchProducts(params){
    setLoading(true)
    try{
      const res = await getProducts({ ...params, page: params?.page || 1, pageSize: params?.pageSize || 12 })
      if (res.ok) {
        setProducts(res.dados || [])
        setPagination({ page: params?.page || 1, total: res.total || (res.dados || []).length })
      }
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  async function handleSearch(e){
    e.preventDefault()
    fetchProducts({ q, page: 1 })
  }

  // debounce search
  useEffect(()=>{
    const id = setTimeout(()=>{ if (q) fetchProducts({ q }) }, 450)
    return ()=> clearTimeout(id)
  },[q])

  return (
    <div className="catalog-page">
      <h1>Catálogo</h1>
      <div className="filters">
        <form onSubmit={handleSearch}>
          <input placeholder="Buscar produto" value={q} onChange={e=>setQ(e.target.value)} />
          <button type="submit">Buscar</button>
        </form>
      </div>
      <div className="grid">
        {loading ? (
          Array.from({length:8}).map((_,i)=>(<SkeletonCard key={`s-${i}`} />))
        ) : (products && products.length>0 ? products.map(p=> <ProductCard key={p.id} product={p} />) : sampleProducts.map(p=> <ProductCard key={p.id} product={p} />))}
      </div>
      <div className="pagination">
        <button disabled={pagination.page<=1} onClick={()=>{ const np = Math.max(1,pagination.page-1); setPagination(s=>({...s,page:np})); fetchProducts({ page: np }) }}>Anterior</button>
        <span> Página {pagination.page} </span>
        <button onClick={()=>{ const np = pagination.page+1; setPagination(s=>({...s,page:np})); fetchProducts({ page: np }) }}>Próxima</button>
      </div>
    </div>
  )
}
