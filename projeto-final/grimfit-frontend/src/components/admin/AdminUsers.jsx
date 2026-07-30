import React, { useEffect, useState } from 'react'
import { adminGetUsers, adminUpdateUserType, adminDeleteUser } from '../../api'
import { useToast } from '../ToastContext'
import { useAuth } from '../../context/AuthContext'

const TIPOS = ['cliente', 'admin', 'suporte']

export default function AdminUsers() {
  const { show } = useToast()
  const { user: usuarioLogado } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    try {
      setUsuarios(await adminGetUsers())
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  async function handleTipo(id, tipo) {
    try {
      await adminUpdateUserType(id, tipo)
      show('Tipo de usuário atualizado', 'success')
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao atualizar', 'error')
    }
  }

  async function apagar(id) {
    if (!window.confirm('Apagar esse usuário? Só funciona se ele não tiver pedidos.')) return
    try {
      await adminDeleteUser(id)
      show('Usuário removido', 'success')
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao remover usuário', 'error')
    }
  }

  return (
    <div className="admin-secao">
      <h3>Usuários</h3>
      {carregando ? (
        <p className="muted">Carregando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {usuarios.map(u => {
              const ehVoceMesmo = usuarioLogado && u.id === usuarioLogado.id
              return (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.tipo}
                      disabled={ehVoceMesmo}
                      onChange={e => handleTipo(u.id, e.target.value)}
                    >
                      {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td>
                    {ehVoceMesmo ? (
                      <span className="muted">Você</span>
                    ) : (
                      <button onClick={() => apagar(u.id)}>Apagar</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
