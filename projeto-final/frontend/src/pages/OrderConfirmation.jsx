import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrder, confirmOrder } from '../api'
import { useCartActions } from '../context/CartContext'

export default function OrderConfirmation(){
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const { clearCart } = useCartActions()

  useEffect(()=>{
    async function load(){
      try{
        const res = await getOrder(id)
        setOrder(res.order)
      }catch(e){ console.error(e) }
    }
    load()
  },[id])

  async function handleConfirm(){
    try{
      const res = await confirmOrder(id)
      setOrder(res.order)
      clearCart()
      alert('Pagamento confirmado (simulado)')
    }catch(e){ console.error(e); alert('Erro') }
  }

  if (!order) return <div>Carregando pedido...</div>

  return (
    <div className="order-page" style={{padding:16}}>
      <h1>Pedido #{order.id}</h1>
      <div>Data: {new Date(order.createdAt).toLocaleString()}</div>
      <div style={{marginTop:12}}>
        <h3>Pagamento</h3>
        <div>Método: {order.payment.method}</div>
        <div>Status: {order.payment.status}</div>
        <pre style={{background:'#0b0b0d',padding:12,borderRadius:8}}>{JSON.stringify(order.payment.info,null,2)}</pre>
      </div>
      {order.payment.status !== 'paid' && (
        <div style={{marginTop:12}}>
          <button className="btn primary" onClick={handleConfirm}>Simular confirmação do pagamento</button>
        </div>
      )}
    </div>
  )
}
