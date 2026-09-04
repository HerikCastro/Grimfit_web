import React, { useEffect, useState } from 'react'
import { getVariants, adminCreateVariant, adminUpdateVariant, adminDeleteVariant } from '../../api'
import { useToast } from '../ToastContext'

export default function AdminVariants({ produtoId }) {
  const { show } = useToast()
  const [variacoes, setVariacoes] = useState([])
  const [form, setForm] = useState({ tamanho: '', cor: '', estoque: '' })

  useEffect(() => { carregar() }, [produtoId])

  async function carregar() {
    try {
      const variants = await getVariants(produtoId)
      setVariacoes(Array.isArray(variants) ? variants : [])
    } catch (e) { console.error(e) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await adminCreateVariant(produtoId, {
        size: form.tamanho,
        color: form.cor,
        stock: Number(form.estoque) || 0
      })
      setForm({ tamanho: '', cor: '', estoque: '' })
      await carregar()
    } catch (err) {
      show('Erro ao criar variação', 'error')
    }
  }

  async function handleEstoque(v, novoEstoque) {
    try {
      await adminUpdateVariant(v.id, { stock: Number(novoEstoque) })
      await carregar()
    } catch (err) {
      show('Erro ao atualizar estoque', 'error')
    }
  }

  async function apagar(id) {
    if (!window.confirm('Apagar essa variação?')) return
    try {
      await adminDeleteVariant(id)
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao remover variação', 'error')
    }
  }

  return (
    <div className="admin-variantes">
      <form onSubmit={handleAdd} className="admin-form-variante">
        <input placeholder="Tamanho (ex: 42, M, G)" value={form.tamanho} onChange={e => setForm({ ...form, tamanho: e.target.value })} />
        <input placeholder="Cor" value={form.cor} onChange={e => setForm({ ...form, cor: e.target.value })} />
        <input placeholder="Estoque" type="number" min="0" value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} required />
        <button type="submit" className="btn primary small">+ Adicionar variação</button>
      </form>

      {variacoes.length === 0 ? (
        <p className="muted">Sem variações — produto não pode ser vendido até ter ao menos uma.</p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Tamanho</th><th>Cor</th><th>Estoque</th><th>Ações</th></tr></thead>
          <tbody>
            {variacoes.map(v => (
              <tr key={v.id}>
                <td>{v.size || '-'}</td>
                <td>{v.color || '-'}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    defaultValue={v.stock}
                    onBlur={e => handleEstoque(v, e.target.value)}
                    className="input-estoque"
                  />
                </td>
                <td><button className="btn danger small" onClick={() => apagar(v.id)}>Apagar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
