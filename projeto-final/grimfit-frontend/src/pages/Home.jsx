import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import BrandsCarousel from '../components/BrandsCarousel'
import FeaturedSection from '../components/FeaturedSection'
import CategorySection from '../components/CategorySection'
import NovidadesCarousel from '../components/NovidadesCarousel'
import SkeletonCard from '../components/SkeletonCard'
import { getProducts, getCategories, getBrands } from '../api'
import { ensureArray } from '../utils/normalizeCollection'

export default function Home() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarTudo() {
      setCarregando(true)
      const carregarProdutos = getProducts({ sort: 'recentes', limit: 12 })
        .then(resProdutos => {
          setProdutos(ensureArray(resProdutos?.products ?? resProdutos))
        })
        .catch(err => {
          console.error('Erro ao carregar produtos', err)
          setProdutos([])
        })

      const carregarCategorias = getCategories()
        .then(resCategorias => {
          setCategorias(ensureArray(resCategorias))
        })
        .catch(err => {
          console.error('Erro ao carregar categorias', err)
          setCategorias([])
        })

      const carregarMarcas = getBrands()
        .then(resMarcas => {
          setMarcas(ensureArray(resMarcas))
        })
        .catch(err => {
          console.error('Erro ao carregar marcas', err)
          setMarcas([])
        })

      await Promise.all([carregarProdutos, carregarCategorias, carregarMarcas])
      setCarregando(false)
    }
    carregarTudo()
  }, [])

  const brandsParaCarousel = marcas.map(m => ({ id: m.id, name: m.nome, logo: m.imagem_url }))
  const categoriasParaSecao = categorias.map(c => ({ id: c.id, name: c.nome }))

  const destaque = produtos[0]

  return (
    <div className="home-page">
      <div className="home-intro-strip">
        <span>GRIMFIT</span>
        <span>MODA URBANA / GÓTICA / SK8 / VIDA ESPORTIVA</span>
        <span>EXPLORE AS NOVIDADES ↓</span>
      </div>
      {destaque ? (
        <Hero product={{
          id: destaque.id,
          title: destaque.name || destaque.nome,
          subtitle: destaque.description || destaque.descricao,
          price: destaque.price ?? destaque.preco,
          imageUrl: destaque.imageUrl || destaque.imagem_url,
          brand: destaque.brandName || destaque.marca_nome
        }} />
      ) : carregando ? (
        <section className="hero hero-skeleton" aria-hidden="true">
          <div className="hero-content">
            <div className="skeleton-line" style={{ width: '40%', height: 16 }} />
            <div className="skeleton-line" style={{ width: '70%', height: 34, margin: '14px 0' }} />
            <div className="skeleton-line" style={{ width: '30%', height: 40 }} />
          </div>
        </section>
      ) : (
        <section className="hero hero-vazio">
          <div className="hero-content">
            <h1>GRIMFIT</h1>
            <p className="muted lead">Cadastre o primeiro produto no painel admin pra ele aparecer aqui.</p>
          </div>
        </section>
      )}

      <div className="container">
        {produtos.length > 0 ? (
          <NovidadesCarousel items={produtos} />
        ) : carregando ? (
          <div className="grid" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <section className="secao-vazia">
            <h2>Novidades</h2>
            <p className="muted">Nenhum produto cadastrado ainda.</p>
          </section>
        )}

        {produtos.length > 0 && (
          <FeaturedSection title="Mais vendidos" products={produtos} />
        )}

        {marcas.length > 0 ? (
          <BrandsCarousel brands={brandsParaCarousel} />
        ) : !carregando && (
          <section className="secao-vazia">
            <h2>Marcas</h2>
            <p className="muted">Nenhuma marca cadastrada ainda.</p>
          </section>
        )}

        {categorias.length > 0 ? (
          <CategorySection title="Categorias" categories={categoriasParaSecao} />
        ) : !carregando && (
          <section className="secao-vazia">
            <h2>Categorias</h2>
            <p className="muted">Nenhuma categoria cadastrada ainda.</p>
          </section>
        )}

        {produtos.length === 0 && categorias.length === 0 && marcas.length === 0 && !carregando && (
          <p className="dica-admin">
            Loja ainda vazia — <Link to="/admin">acesse o painel admin</Link> pra começar a cadastrar.
          </p>
        )}
      </div>
    </div>
  )
}
