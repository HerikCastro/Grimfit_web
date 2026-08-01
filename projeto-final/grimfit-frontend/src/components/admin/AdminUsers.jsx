import React, { useEffect, useState } from 'react'
import { adminGetUsers, adminUpdateUserType, adminDeleteUser } from '../../api'
import { useToast } from '../ToastContext'
import { useAuth } from '../../context/AuthContext'
import ConfirmModal from '../ui/ConfirmModal'

const TIPOS = ['cliente', 'admin', 'suporte']

export default function AdminUsers() {
  const { show } = useToast()
  const { user: eu } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modal, setModal] = useState(null) // { tipo: 'apagar'|'promover', id, novoTipo? }
  const [loadingModal, setLoadingModal] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    try { setUsuarios(await adminGetUsers()) } catch (e) { console.error(e) } finally { setCarregando(false) }
  }

  async function handleConfirm(senha) {
    setLoadingModal(true)
    try {
      if (modal.tipo === 'apagar') {
        await adminDeleteUser(modal.id, senha)
        show('Usuário removido', 'success')
      } else {
        await adminUpdateUserType(modal.id, modal.novoTipo, senha)
        show('Tipo atualizado', 'success')
      }
      setModal(null)
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Senha incorreta ou erro', 'error')
    } finally { setLoadingModal(false) }
  }

  return (
    <div className="admin-secao">
      {modal && (
        <ConfirmModal
          mensagem={
            modal.tipo === 'apagar'
              ? 'Apagar esse usuário? Só funciona se ele não tiver pedidos vinculados.'
              : `Alterar tipo para "${modal.novoTipo}"?`
          }
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          loading={loadingModal}
        />
      )}
      <h3>Usuários</h3>
      {carregando ? <p className="muted">Carregando...</p> : (
        <div className="usuarios-lista">
          {usuarios.map(u => {
            const ehEu = eu && u.id === eu.id
            return (
              <div key={u.id} className={`usuario-item ${ehEu ? 'usuario-eu' : ''}`}>
                <div className="usuario-avatar">{u.nome?.[0]?.toUpperCase()}</div>
                <div className="usuario-info">
                  <span className="usuario-nome">{u.nome} {ehEu && <span className="badge-voce">Você</span>}</span>
                  <span className="usuario-email muted">{u.email}</span>
                </div>
                <div className="usuario-acoes">
                  {!ehEu && (
                    <>
                      <select
                        value={u.tipo}
                        onChange={e => setModal({ tipo: 'promover', id: u.id, novoTipo: e.target.value })}
                        className="usuario-tipo-select"
                      >
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button className="btn danger small" onClick={() => setModal({ tipo: 'apagar', id: u.id })}>
                        Apagar
                      </button>
                    </>
                  )}
                  {ehEu && <span className={`badge-tipo badge-${u.tipo}`}>{u.tipo}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
