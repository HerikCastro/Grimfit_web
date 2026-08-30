import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import Pagination from '../components/ui/Pagination'
import { getProducts, getCategories, getBrands, getStyles } from '../api'
import { ensureArray } from '../utils/normalizeCollection'

const ABAS_CATALOG = [
  { chave: 'loja', rotulo: 'Loja' },
  { chave: 'estilos', rotulo: 'Estilos' }
]

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()

  const aba = searchParams.get('aba') || 'loja'
  const busca = searchParams.get('busca') || ''
  const categoriaId = searchParams.get('categoria_id') || ''
  const marcaId = searchParams.get('marca_id') || ''
  const estiloId = searchParams.get('estilo_id') || ''
  const ordenar = searchParams.get('ordenar') || 'recentes'

  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [estilos, setEstilos] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [temProxima, setTemProxima] = useState(false)

  const LIMIT = 12

  useEffect(() => {
    getCategories()
      .then((data) => setCategorias(ensureArray(data)))
      .catch(() => setCategorias([]))

    getBrands()
      .then((data) => setMarcas(ensureArray(data)))
      .catch(() => setMarcas([]))

    getStyles()
      .then((data) => setEstilos(ensureArray(data)))
      .catch(() => setEstilos([]))
  }, [])

  useEffect(() => {
    buscarProdutos(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, categoriaId, marcaId, estiloId, ordenar, aba])

  async function buscarProdutos(page) {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT, ordenar }
      if (busca) params.busca = busca
      if (categoriaId) params.categoria_id = categoriaId
      if (marcaId) params.marca_id = marcaId
      if (estiloId) params.estilo_id = estiloId

      const res = await getProducts(params)
      const lista = ensureArray(res?.produtos ?? res)
      setProdutos(lista)
      setPagina(Number(res?.pagina || page) || 1)
      setTemProxima(lista.length === LIMIT)
    } catch (e) {
      console.error(e)
      setProdutos([])
      setTemProxima(false)
    } finally {
      setLoading(false)
    }
  }

  function atualizar(chave, valor) {
    const p = new URLSearchParams(searchParams)
    if (valor) p.set(chave, valor)
    else p.delete(chave)
    setSearchParams(p)
  }

  function trocarAba(chave) {
    const p = new URLSearchParams(searchParams)
    p.set('aba', chave)
    // Evita manter um filtro invisível ativo ao trocar de aba (ex: um
    // estilo selecionado continuando a filtrar a Loja sem aparecer
    // marcado em lugar nenhum na tela).
    if (chave === 'loja') p.delete('estilo_id')
    else p.delete('categoria_id')
    setSearchParams(p)
  }

  function handleBusca(e) {
    e.preventDefault()
    atualizar('busca', e.target.elements.busca.value)
  }

  return (
    <div className="catalog-page">
      {/* abas Loja / Estilos */}
      <div className="catalog-abas" role="tablist">
        {ABAS_CATALOG.map(a => (
          <button
            key={a.chave}
            role="tab"
            aria-selected={aba === a.chave}
            className={`catalog-aba ${aba === a.chave ? 'ativa' : ''}`}
            onClick={() => trocarAba(a.chave)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="filtros">
        <form onSubmit={handleBusca} className="filtro-busca">
          <input name="busca" placeholder="Buscar produto..." defaultValue={busca} />
          <button type="submit">Buscar</button>
        </form>

        {aba === 'estilos' ? (
          <div className="filtro-estilos">
            {estilos.map(e => (
              <button
                key={e.id}
                type="button"
                className={`estilo-chip ${estiloId === String(e.id) ? 'selecionado' : ''}`}
                onClick={() => atualizar('estilo_id', estiloId === String(e.id) ? '' : String(e.id))}
              >
                {e.nome}
              </button>
            ))}
          </div>
        ) : (
          <>
            <select value={categoriaId} onChange={e => atualizar('categoria_id', e.target.value)}>
              <option value="">Todas as categorias</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select value={marcaId} onChange={e => atualizar('marca_id', e.target.value)}>
              <option value="">Todas as marcas</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </>
        )}

        <select value={ordenar} onChange={e => atualizar('ordenar', e.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="preco_asc">Menor preço</option>
          <option value="preco_desc">Maior preço</option>
          <option value="nome_asc">A–Z</option>
        </select>
      </div>

      <div className="grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : produtos.length > 0
            ? produtos.map(p => <ProductCard key={p.id} product={p} />)
            : <p className="muted">Nenhum produto encontrado.</p>
        }
      </div>

      {!loading && produtos.length > 0 && (
        <Pagination
          pagina={pagina}
          temProxima={temProxima}
          onChange={p => buscarProdutos(p)}
        />
      )}
    </div>
  )
}
