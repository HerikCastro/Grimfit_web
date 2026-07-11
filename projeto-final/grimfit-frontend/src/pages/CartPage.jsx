import React from 'react'
import { useCart, useCartActions, cartTotal } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import Img from '../components/Img'

export default function CartPage(){
  const items = useCart()
  const { removeFromCart, updateQty, clearCart } = useCartActions()
  const total = cartTotal(items)
  const navigate = useNavigate()

  return (
    <div className="cart-page">
      <h1>Seu Carrinho</h1>
      <div className="cart-list">
        {items.length===0 && <div>Nenhum item no carrinho</div>}
        {items.map(i=> {
          return (
          <div key={i.id} className="cart-item" style={{display:'flex',gap:12,alignItems:'center',padding:12,background:'var(--panel)',borderRadius:8,marginBottom:8}}>
            <div style={{width:80,height:80,overflow:'hidden',borderRadius:6}}>
              <Img src={i.image} alt={i.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',opacity:0}} onLoad={e=>{ e.currentTarget.style.opacity='1' }} />
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700}}>{i.name}</div>
              <div style={{color:'var(--muted)'}}>Tamanho: {i.size} • Cor: {i.color}</div>
              <div style={{color:'var(--accent)'}}>R$ {i.price}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
              <div>
                <button onClick={()=>updateQty(i.id, i.qty-1)}>-</button>
                <span style={{margin:'0 8px'}}>{i.qty}</span>
                <button onClick={()=>updateQty(i.id, i.qty+1)}>+</button>
              </div>
              <button onClick={()=>removeFromCart(i.id)} style={{color:'#ff6b6b',background:'transparent',border:0,cursor:'pointer'}}>Remover</button>
            </div>
          </div>
          )
        })}
      </div>
      <div className="cart-summary" style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Total: R$ {total.toFixed(2).replace('.',',')}</div>
        <div style={{marginTop:8,display:'flex',gap:8}}>
          <button className="btn primary" onClick={() => navigate('/checkout')}>Finalizar compra</button>
          <button className="btn" onClick={() => clearCart()}>Limpar</button>
        </div>
      </div>
    </div>
  )
}
