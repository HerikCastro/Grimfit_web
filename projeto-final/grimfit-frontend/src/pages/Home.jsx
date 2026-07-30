import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import BrandsCarousel from '../components/BrandsCarousel'
import FeaturedSection from '../components/FeaturedSection'
import CategorySection from '../components/CategorySection'
import NovidadesCarousel from '../components/NovidadesCarousel'
import { getProducts, getCategories, getBrands } from '../api'

export default function Home() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarTudo() {
      setCarregando(true)
      try {
        const [resProdutos, resCategorias, resMarcas] = await Promise.all([
          getProducts({ ordenar: 'recentes', limit: 12 }),
          getCategories(),
          getBrands()
        ])
        setProdutos(resProdutos.produtos || [])
        setCategorias(resCategorias || [])
        setMarcas(resMarcas || [])
      } catch (err) {
        console.error('Erro ao carregar a home', err)
      } finally {
        setCarregando(false)
      }
    }
    carregarTudo()
  }, [])

  const brandsParaCarousel = marcas.map(m => ({ id: m.id, name: m.nome, logo: m.imagem_url }))
  const categoriasParaSecao = categorias.map(c => ({ id: c.id, name: c.nome, image: c.imagem_url }))

  const destaque = produtos[0]

  return (
    <div className="home-page">
      {destaque ? (
        <Hero product={{
          id: destaque.id,
          title: destaque.nome,
          subtitle: destaque.descricao,
          price: destaque.preco,
          image: destaque.imagem_url
        }} />
      ) : !carregando && (
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
        ) : !carregando && (
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
