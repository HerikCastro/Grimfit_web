import React, { useEffect, useState } from 'react'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api'
import { useToast } from '../ToastContext'
import ConfirmModal from '../ui/ConfirmModal'

const STATUS_OPCOES = ['pendente', 'pago', 'separacao', 'enviado', 'saiu_entrega', 'entregue', 'cancelado']

export default function AdminOrders() {
  const { show } = useToast()
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [alteracaoPendente, setAlteracaoPendente] = useState(null)
  const [salvandoStatus, setSalvandoStatus] = useState(false)

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

  function handleStatus(id, status) {
    setAlteracaoPendente({ id, status })
  }

  async function confirmarStatus() {
    if (!alteracaoPendente) return
    setSalvandoStatus(true)
    try {
      await adminUpdateOrderStatus(alteracaoPendente.id, alteracaoPendente.status)
      show('Status atualizado', 'success')
      setAlteracaoPendente(null)
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao atualizar status', 'error')
    } finally {
      setSalvandoStatus(false)
    }
  }

  return (
    <div className="admin-secao">
      {alteracaoPendente && (
        <ConfirmModal
          mensagem={`Tem certeza que deseja alterar o status do pedido #${alteracaoPendente.id} para ${alteracaoPendente.status}?`}
          onConfirm={confirmarStatus}
          onCancel={() => setAlteracaoPendente(null)}
          loading={salvandoStatus}
          requirePassword={false}
        />
      )}
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
