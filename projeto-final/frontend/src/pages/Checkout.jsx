import React, { useState } from 'react'
import { useCart, useCartActions, cartTotal } from '../context/CartContext'
import { createCheckout } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Checkout(){
  const items = useCart()
  const { clearCart } = useCartActions()
  const [method, setMethod] = useState('pix')
  const [processing, setProcessing] = useState(false)
  const [customer, setCustomer] = useState({ name:'', email:'' })
  const navigate = useNavigate()

  const total = cartTotal(items)

  async function handlePay(e){
    e.preventDefault()
    if (items.length===0) return alert('Carrinho vazio')
    setProcessing(true)
    try{
      const payload = { items, customer, payment: { method } }
      const res = await createCheckout(payload)
      const order = res.order
      // se cartão já pago, limpar carrinho e ir para confirmação
      if (order.payment.status === 'paid') {
        clearCart()
      }
      navigate(`/order/${order.id}`)
    }catch(err){
      console.error(err)
      alert('Erro ao processar pagamento')
    } finally { setProcessing(false) }
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20}}>
        <form onSubmit={handlePay} style={{padding:16,background:'var(--panel)',borderRadius:8}}>
          <h3>Dados do comprador</h3>
          <input placeholder="Nome completo" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} />
          <input placeholder="Email" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} />

          <h3>Método de pagamento</h3>
          <label><input type="radio" checked={method==='pix'} onChange={()=>setMethod('pix')} /> PIX</label>
          <label><input type="radio" checked={method==='card'} onChange={()=>setMethod('card')} /> Cartão de Crédito</label>
          <label><input type="radio" checked={method==='debit'} onChange={()=>setMethod('debit')} /> Cartão de Débito</label>
          <label><input type="radio" checked={method==='boleto'} onChange={()=>setMethod('boleto')} /> Boleto</label>

          {method==='card' && (
            <div style={{marginTop:12}}>
              <input placeholder="Número do cartão" />
              <input placeholder="MM/AA" style={{width:120,marginRight:8}} />
              <input placeholder="CVC" style={{width:80}} />
            </div>
          )}

          <div style={{marginTop:16}}>
            <button className="btn primary" disabled={processing}>{processing? 'Processando...':'Pagar agora'}</button>
          </div>
        </form>

        <aside style={{padding:16,background:'var(--panel)',borderRadius:8}}>
          <h3>Resumo</h3>
          <div>{items.length} itens</div>
          <div style={{marginTop:8,fontWeight:700}}>Total: R$ {total.toFixed(2).replace('.',',')}</div>
          <div style={{marginTop:12}}>
            <small>Ao confirmar, você será redirecionado para a página do pedido.</small>
          </div>
        </aside>
      </div>
    </div>
  )
}
