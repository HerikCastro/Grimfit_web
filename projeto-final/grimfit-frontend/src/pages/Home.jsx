import React, { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import BrandsCarousel from '../components/BrandsCarousel'
import FeaturedSection from '../components/FeaturedSection'
import CategorySection from '../components/CategorySection'
import NovidadesCarousel from '../components/NovidadesCarousel'
import { getProducts } from '../api'

// Use only filenames here; components will resolve to /img/<filename>
const heroProduct = { id:1, title: 'Tênis TN Shadow', subtitle: 'O clássico TN com alma tech e sola destacada.', price: '499,90', image: 'dcshoes.jpg' }

const brands = [
  { id: 'nike', name: 'NIKE', logo: 'nike.jpg' },
  { id: 'adidas', name: 'ADIDAS', logo: 'adidas.jpg' },
  { id: 'puma', name: 'PUMA', logo: 'puma.jpg' },
  { id: 'sk8', name: 'SK8', logo: 'sk8.png' }
]

// products will be fetched from backend

const categories = [
  { id: 'nike', name: 'NIKE', image: 'nike.jpg' },
  { id: 'adidas', name: 'ADIDAS', image: 'adidas.jpg' },
  { id: 'puma', name: 'PUMA', image: 'puma.jpg' },
  { id: 'tn', name: 'TN / RUNNER', image: 'dcshoes.jpg' },
  { id: 'jordan', name: 'JORDAN', image: 'sk8.png' },
  { id: 'casual', name: 'CASUAL', image: 'casa.png' }
]

export default function Home(){
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function loadProducts(){
      try{
        const data = await getProducts()
        setProducts(data || [])
      }catch(err){
        console.error('Erro ao carregar produtos', err)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="home-page">
      <Hero product={heroProduct} />

      <div className="container">
        <NovidadesCarousel items={products} />

        <FeaturedSection title="Mais vendidos" products={products} />

        <BrandsCarousel brands={brands} />

        <CategorySection title="Categorias" categories={categories} />
      </div>
    </div>
  )
}
