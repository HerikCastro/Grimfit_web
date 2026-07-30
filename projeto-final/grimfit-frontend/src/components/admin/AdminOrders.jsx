import React, { useEffect, useState } from 'react'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api'
import { useToast } from '../ToastContext'

const STATUS_OPCOES = ['pendente', 'pago', 'separacao', 'enviado', 'saiu_entrega', 'entregue', 'cancelado']

export default function AdminOrders() {
  const { show } = useToast()
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    try {
      setPedidos(await adminGetOrders())
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  async function handleStatus(id, status) {
    try {
      await adminUpdateOrderStatus(id, status)
      show('Status atualizado', 'success')
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao atualizar status', 'error')
    }
  }

  return (
    <div className="admin-secao">
      <h3>Pedidos</h3>
      {carregando ? (
        <p className="muted">Carregando...</p>
      ) : pedidos.length === 0 ? (
        <p className="muted">Nenhum pedido ainda.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th></tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.usuario_nome}<br /><span className="muted">{p.usuario_email}</span></td>
                <td>R$ {p.valor_total}</td>
                <td>
                  <select value={p.status} onChange={e => handleStatus(p.id, e.target.value)}>
                    {STATUS_OPCOES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
