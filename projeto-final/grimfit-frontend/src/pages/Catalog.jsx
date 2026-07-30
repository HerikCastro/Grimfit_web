import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import { getProducts, getCategories, getBrands } from '../api'

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagina, setPagina] = useState(1)

  const busca = searchParams.get('busca') || ''
  const categoriaId = searchParams.get('categoria_id') || ''
  const marcaId = searchParams.get('marca_id') || ''
  const ordenar = searchParams.get('ordenar') || 'recentes'

  useEffect(() => {
    getCategories().then(setCategorias).catch(() => setCategorias([]))
    getBrands().then(setMarcas).catch(() => setMarcas([]))
  }, [])

  useEffect(() => {
    buscarProdutos(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, categoriaId, marcaId, ordenar])

  async function buscarProdutos(page) {
    setLoading(true)
    try {
      const params = { page, limit: 12, ordenar }
      if (busca) params.busca = busca
      if (categoriaId) params.categoria_id = categoriaId
      if (marcaId) params.marca_id = marcaId

      const res = await getProducts(params)
      setProdutos(res.produtos || [])
      setPagina(res.pagina || 1)
    } catch (e) {
      console.error(e)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  function atualizarFiltro(chave, valor) {
    const proximos = new URLSearchParams(searchParams)
    if (valor) proximos.set(chave, valor)
    else proximos.delete(chave)
    setSearchParams(proximos)
  }

  function handleBuscaSubmit(e) {
    e.preventDefault()
    const termo = e.target.elements.busca.value
    atualizarFiltro('busca', termo)
  }

  return (
    <div className="catalog-page">
      <h1>Catálogo</h1>

      <div className="filtros">
        <form onSubmit={handleBuscaSubmit} className="filtro-busca">
          <input name="busca" placeholder="Buscar produto" defaultValue={busca} />
          <button type="submit">Buscar</button>
        </form>

        <select value={categoriaId} onChange={e => atualizarFiltro('categoria_id', e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>

        <select value={marcaId} onChange={e => atualizarFiltro('marca_id', e.target.value)}>
          <option value="">Todas as marcas</option>
          {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>

        <select value={ordenar} onChange={e => atualizarFiltro('ordenar', e.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="preco_asc">Menor preço</option>
          <option value="preco_desc">Maior preço</option>
          <option value="nome_asc">Nome (A-Z)</option>
        </select>
      </div>

      <div className="grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)
        ) : produtos.length > 0 ? (
          produtos.map(p => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="muted">Nenhum produto encontrado.</p>
        )}
      </div>

      {produtos.length > 0 && (
        <div className="pagination">
          <button disabled={pagina <= 1} onClick={() => buscarProdutos(pagina - 1)}>Anterior</button>
          <span>Página {pagina}</span>
          <button onClick={() => buscarProdutos(pagina + 1)}>Próxima</button>
        </div>
      )}
    </div>
  )
}
