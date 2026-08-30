import React, { useEffect, useState } from 'react'
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '../../api'
import { useToast } from '../ToastContext'

const VAZIO = { codigo: '', desconto: '', validade: '' }

export default function AdminCoupons() {
  const { show } = useToast()
  const [cupons, setCupons] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setCupons(await adminGetCoupons()) } catch (e) { console.error(e) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await adminCreateCoupon({
        codigo: form.codigo,
        desconto: Number(form.desconto),
        validade: form.validade || null
      })
      show('Cupom criado', 'success')
      setForm(VAZIO)
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao criar cupom', 'error')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarAtivo(cupom) {
    try {
      await adminUpdateCoupon(cupom.id, { ativo: !cupom.ativo })
      await carregar()
    } catch (err) {
      show('Erro ao atualizar cupom', 'error')
    }
  }

  async function apagar(id) {
    if (!window.confirm('Apagar esse cupom?')) return
    try {
      await adminDeleteCoupon(id)
      show('Cupom removido', 'success')
      await carregar()
    } catch (err) {
      show('Erro ao remover cupom', 'error')
    }
  }

  return (
    <div className="admin-secao">
      <h3>Novo cupom</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-row">
          <div className="form-campo">
            <label htmlFor="cup-codigo">Código</label>
            <input id="cup-codigo" placeholder="ex: PROMO10" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })} required />
          </div>
          <div className="form-campo">
            <label htmlFor="cup-desconto">Desconto (%)</label>
            <input id="cup-desconto" placeholder="10" type="number" min="1" max="100" value={form.desconto} onChange={e => setForm({ ...form, desconto: e.target.value })} required />
          </div>
          <div className="form-campo">
            <label htmlFor="cup-validade">Validade (opcional)</label>
            <input id="cup-validade" type="date" value={form.validade} onChange={e => setForm({ ...form, validade: e.target.value })} />
          </div>
        </div>
        <div className="admin-form-acoes">
          <button type="submit" className="btn primary" disabled={salvando}>
            {salvando ? 'Criando...' : 'Criar cupom'}
          </button>
        </div>
      </form>

      <h3>Cupons cadastrados</h3>
      {cupons.length === 0 ? <p className="muted">Nenhum cupom ainda.</p> : (
        <table className="admin-table">
          <thead><tr><th>Código</th><th>Desconto</th><th>Ativo</th><th>Ações</th></tr></thead>
          <tbody>
            {cupons.map(c => (
              <tr key={c.id}>
                <td>{c.codigo}</td>
                <td>{c.desconto}%</td>
                <td>
                  <span className={`status-pill ${c.ativo ? 'status-ok' : 'status-off'}`}>
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="admin-table-acoes">
                  <button className="btn small" onClick={() => alternarAtivo(c)}>
                    {c.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button className="btn danger small" onClick={() => apagar(c.id)}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
