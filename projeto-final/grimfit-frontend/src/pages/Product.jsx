import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCartActions } from '../context/CartContext'
import { getProduct } from '../api'
import { guessFromName } from '../utils/images'
import Img from '../components/Img'

export default function Product(){
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [size, setSize] = useState('38')
  const [color, setColor] = useState('Preto')
  const { addToCart } = useCartActions()

  useEffect(()=>{ fetchProduct() },[id])

  async function fetchProduct(){
    try{
      const res = await getProduct(id)
      if (res.ok) setProduct(res.produto || res.dados || res)
    }catch(e){ console.error(e) }
  }

  function handleAdd(){
    if (!product) return
    addToCart({ id: product.id, name: product.nome || product.name, price: product.preco || product.price, image: product.imagem || product.image, size, color, qty: 1 })
    alert('Adicionado ao carrinho')
  }

  if (!product) return <div>Carregando produto...</div>

  const rawImg = product.imagem || product.image || guessFromName(product) || '/src/assets/shoe1.svg'

  return (
    <div className="product-page">
      <div className="gallery">
        <div className="main-image">
          <Img src={rawImg} alt={product.nome || product.name} onLoad={e=>{ e.currentTarget.style.opacity='1' }} />
        </div>
        <div className="thumbs">thumbs</div>
      </div>
      <div className="details">
        <h1>{product.nome || product.name}</h1>
        <div className="price">R$ {product.preco || product.price}</div>
        <p>{product.descricao || product.description}</p>
        <div className="selectors">
          <select value={size} onChange={e=>setSize(e.target.value)}><option>38</option><option>39</option></select>
          <select value={color} onChange={e=>setColor(e.target.value)}><option>Preto</option><option>Roxo</option></select>
        </div>
        <button className="btn primary" onClick={handleAdd}>Adicionar ao carrinho</button>
      </div>
    </div>
  )
}
