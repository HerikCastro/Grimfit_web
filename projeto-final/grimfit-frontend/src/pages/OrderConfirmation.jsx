import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../api'

export default function OrderConfirmation() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    getOrder(id).then(setPedido).catch(() => setErro(true))
  }, [id])

  if (erro) return <div>Pedido não encontrado.</div>
  if (!pedido) return <div>Carregando pedido...</div>

  return (
    <div className="order-page">
      <h1>Pedido #{pedido.id}</h1>
      <div className="muted">Feito em: {new Date(pedido.created_at).toLocaleString('pt-BR')}</div>
      <div className="pedido-status">Status: <strong>{pedido.status}</strong></div>

      <h3>Itens</h3>
      <div className="pedido-itens">
        {pedido.itens?.map((item, i) => (
          <div key={i} className="pedido-item">
            <span>{item.nome} x{item.quantidade}</span>
            <span>R$ {item.preco_unitario}</span>
          </div>
        ))}
      </div>

      <div className="pedido-total">Total: R$ {pedido.valor_total}</div>

      <Link className="btn primary" to="/catalog">Continuar comprando</Link>
    </div>
  )
}
